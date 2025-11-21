import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose, { Types } from 'mongoose';
import aqp from 'api-query-params';
import { Category } from 'src/category/schemas/category.schema';
import { Product, ProductDocument } from './schemas/products.schemas';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,

    @InjectModel(Category.name)
    private categoryModel: mongoose.Model<Category>
  ) { }

  async create(createProductDto: CreateProductDto, user: IUser) {
    const {
      name,
      thumbnail,
      slider,
      mainText,
      desc,
      price,
      sold,
      quantity,
      category,
    } = createProductDto;

    const categoryExist = await this.categoryModel.findById(category);
    if (!categoryExist) {
      throw new BadRequestException('Category không tồn tại');
    }

    const newProduct = await this.productModel.create({
      name,
      thumbnail,
      slider,
      mainText,
      desc,
      price: +price,
      sold: +sold || 0,
      quantity: +quantity,
      category: {
        _id: categoryExist._id,
        name: categoryExist.name,
      },
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      createdAt: newProduct?.createdAt,
      id: newProduct?._id,
    };
  }

  async findAll(currentPage: number, limit: number, qs: any) {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    // ---- Lọc theo danh mục (hỗ trợ deep = lấy cả con cháu) ----
    if (filter.category) {
      const catId = String(filter.category);
      if (!Types.ObjectId.isValid(catId)) {
        throw new BadRequestException('category không hợp lệ');
      }
      const deep =
        filter.deep === 'true' ||
        filter.deep === true ||
        filter.deep === '1' ||
        filter.deep === 1;

      if (deep) {
        const id = new Types.ObjectId(catId);
        const cats = await this.categoryModel
          .find({ $or: [{ _id: id }, { ancestors: id }] })
          .select('_id')
          .lean();

        filter.category = { $in: cats.map((c: any) => c._id) };
      } else {
        filter.category = new Types.ObjectId(catId);
      }
      delete filter.deep;
    }

    // ---- Phân trang / sort ----
    const page = +currentPage > 0 ? +currentPage : 1;
    const pageSize = +limit > 0 ? +limit : 10;
    const offset = (page - 1) * pageSize;

    const totalItems = await this.productModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const result = await this.productModel
      .find(filter, projection)
      .skip(offset)
      .limit(pageSize)
      .sort((sort as any) || { createdAt: -1 })
      .populate({ path: 'category', select: 'name slug' })
      .lean()
      .exec();

    return {
      meta: { current: page, pageSize, pages: totalPages, total: totalItems },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid product id: ${id}`);
    }

    return await this.productModel.findOne({ _id: id })
    .populate([{
      path: "category",
      select: { name: 1 }
    }]);
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid product id: ${id}`);
    }

    return await this.productModel.updateOne(
      { _id: id },
      {
        ...updateProductDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid product id: ${id}`);
    }

    // kiểm tra tồn tại
    const prod = await this.productModel.findById(id);
    if (!prod) {
      throw new BadRequestException('Product không tồn tại');
    }

    // lưu thông tin người xoá (tùy chọn)
    await this.productModel.updateOne(
      { _id: id },
      {
        deletedBy: { _id: user._id, email: user.email },
      }
    );

    // 🟢 XOÁ THẬT
    return await this.productModel.deleteOne({ _id: id });
  }

}
