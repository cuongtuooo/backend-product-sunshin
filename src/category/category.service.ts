import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose, { Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import aqp from 'api-query-params';
import slugify from 'slugify';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: SoftDeleteModel<CategoryDocument>,
  ) { }

  // ---------------- CREATE ----------------
  async create(dto: CreateCategoryDto, user: IUser) {
    const { name, slug, parentId, icon, description, sortOrder, isActive } = dto;

    // Tạo slug nếu không truyền
    const finalSlug =
      slug?.trim() ||
      slugify(name, { lower: true, locale: 'vi', strict: true });

    // Unique slug trong toàn hệ thống (hoặc unique theo parent nếu bạn muốn)
    const existSlug = await this.categoryModel.findOne({ slug: finalSlug });
    if (existSlug) {
      throw new BadRequestException(`Category with slug "${finalSlug}" already exists`);
    }

    let parent: Types.ObjectId | null = null;
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw new BadRequestException('parentId không hợp lệ');
      }
      parent = new Types.ObjectId(parentId);
      const parentDoc = await this.categoryModel.findById(parent);
      if (!parentDoc) {
        throw new BadRequestException('Parent category not found');
      }
    }

    const newCategory = await this.categoryModel.create({
      name: name.trim(),
      slug: finalSlug,
      parent,
      icon,
      description,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
      createdBy: { _id: user._id, email: user.email },
    });

    // hooks trong schema sẽ tự set ancestors + depth theo parent
    return {
      id: newCategory._id,
      createdAt: newCategory.createdAt,
      slug: newCategory.slug,
    };
  }

  // ---------------- LIST (paging + filter) ----------------
  async findAll(currentPage: number, limit: number, qs: any) {
    const { filter, sort, projection, population } = aqp(qs);

    // Loại bỏ tham số phân trang của aqp
    delete (filter as any).current;
    delete (filter as any).pageSize;

    // --- Cast parent ---
    // ?parent=null  => root (parent = null)
    // ?parent=<id>  => con trực tiếp của <id>
    if (filter.parent === 'null') {
      filter.parent = null;
    } else if (filter.parent && mongoose.Types.ObjectId.isValid(filter.parent)) {
      filter.parent = new mongoose.Types.ObjectId(filter.parent);
    } else if (filter.parent) {
      // parent truyền vào không hợp lệ -> không khớp gì
      throw new BadRequestException('parent không hợp lệ');
    }

    // --- Cast ancestors ---
    // ?ancestors=<id>  => mọi cấp con của <id>
    if (filter.ancestors && mongoose.Types.ObjectId.isValid(filter.ancestors)) {
      filter.ancestors = new mongoose.Types.ObjectId(filter.ancestors);
    }

    // --- Tìm kiếm nhanh ---
    // ?q=keyword  => tìm theo name/slug (regex, không phân biệt hoa thường)
    if (filter.q) {
      const q = filter.q;
      delete filter.q;
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
      ];
    }

    // --- Cast isActive nếu cần (tránh "true"/"false" là string) ---
    if (typeof filter.isActive === 'string') {
      filter.isActive = filter.isActive === 'true';
    }

    const page = Number.isFinite(+currentPage) && +currentPage > 0 ? +currentPage : 1;
    const pageSize = Number.isFinite(+limit) && +limit > 0 ? +limit : 10;
    const offset = (page - 1) * pageSize;

    const totalItems = await this.categoryModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const result = await this.categoryModel
      .find(filter, projection)
      .skip(offset)
      .limit(pageSize)
      .sort((sort as any) || { sortOrder: 1, name: 1 })
      .populate(population)
      .lean()
      .exec();

    return {
      meta: {
        current: page,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  // ---------------- DETAIL ----------------
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid category id: ${id}`);
    }
    const doc = await this.categoryModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Category not found');
    return doc;
  }

  // ---------------- TREE HELPERS ----------------
  async findRoots() {
    return this.categoryModel.find({ parent: null, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  // Trả cây (depth: số tầng con muốn mở, default 2)
  async findTree(depth = 2) {
    // Lấy roots rồi nạp con theo depth
    const roots = await this.findRoots();
    const byId = (id: Types.ObjectId | string) => this.categoryModel.findById(id).lean();

    async function build(node: any, level: number): Promise<any> {
      if (level >= depth) return { ...node, children: [] };
      const children = await (this as any).categoryModel
        .find({ parent: node._id, isActive: true })
        .sort({ sortOrder: 1, name: 1 })
        .lean();
      const nested = await Promise.all(children.map((c: any) => build.call(this, c, level + 1)));
      return { ...node, children: nested };
    }

    return Promise.all(roots.map(r => build.call(this, r, 0)));
  }

  async findChildren(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category id');
    }
    const parentId = new mongoose.Types.ObjectId(id); // ✅ ép về ObjectId
    return this.categoryModel
      .find({ parent: parentId }) // nếu dùng soft-delete plugin, mặc định sẽ loại isDeleted=true
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }


  async findBreadcrumbs(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category id');
    }
    const node = await this.categoryModel.findById(id).lean();
    if (!node) throw new NotFoundException('Category not found');

    const ancestors = node.ancestors?.length
      ? await this.categoryModel
        .find({ _id: { $in: node.ancestors } })
        .sort({ depth: 1 })
        .lean()
      : [];
    return [...ancestors, node];
  }

  // ---------------- UPDATE ----------------
  async update(id: string, dto: UpdateCategoryDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid category id: ${id}`);
    }

    const payload: any = { ...dto };

    // Nếu đổi parent, validate ObjectId và tránh set parent là chính nó / con cháu của nó
    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        payload.parent = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(dto.parentId)) {
          throw new BadRequestException('parentId không hợp lệ');
        }
        const self = await this.categoryModel.findById(id).lean();
        if (!self) throw new NotFoundException('Category not found');

        if (dto.parentId === id) {
          throw new BadRequestException('Không thể set parent là chính nó');
        }

        // Không được đặt parent là hậu duệ (tránh vòng lặp)
        const isDescendant = await this.categoryModel.exists({
          _id: dto.parentId,
          ancestors: self._id,
        });
        if (isDescendant) {
          throw new BadRequestException('Không thể set parent là danh mục con của chính nó');
        }
        payload.parent = new Types.ObjectId(dto.parentId);
      }
      delete payload.parentId;
    }

    if (dto.slug) {
      const exist = await this.categoryModel.findOne({
        _id: { $ne: id },
        slug: dto.slug,
      });
      if (exist) throw new BadRequestException('Slug đã tồn tại');
    }

    payload.updatedBy = { _id: user._id, email: user.email };

    // dùng findOneAndUpdate để kích hoạt pre('findOneAndUpdate') hook tính lại ancestors/depth
    const updated = await this.categoryModel
      .findOneAndUpdate({ _id: id }, payload, { new: true })
      .lean();

    return updated;
  }

  // ---------------- DELETE (soft) ----------------
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid category id: ${id}`);
    }

    // Kiểm tra tồn tại
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    // OPTIONAL: cập nhật thông tin người xoá
    await this.categoryModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } }
    );

    // 🟢 XÓA HẲN KHỎI DATABASE
    return this.categoryModel.deleteOne({ _id: id });
  }

}
