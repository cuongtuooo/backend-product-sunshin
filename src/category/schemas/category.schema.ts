// src/categories/category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Model } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
    @Prop({ required: true, trim: true })
    name: string;

    // Slug để build URL, unique cho dễ tìm kiếm
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug: string;

    // ==== Cấu trúc cây ====
    @Prop({ type: Types.ObjectId, ref: 'Category', default: null, index: true })
    parent?: Types.ObjectId | null;

    // Danh sách tổ tiên (để query nhanh subtree & breadcrumbs)
    @Prop({ type: [Types.ObjectId], ref: 'Category', default: [], index: true })
    ancestors: Types.ObjectId[];

    // Độ sâu trong cây (root = 0)
    @Prop({ type: Number, default: 0, index: true })
    depth: number;

    // Sắp xếp trong cùng 1 parent
    @Prop({ type: Number, default: 0 })
    sortOrder: number;

    // Hiển thị/ẩn danh mục
    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    // Meta tuỳ chọn (icon/ảnh/mô tả)
    @Prop() icon?: string;
    @Prop() description?: string;

    // ==== Audit (giữ nguyên của bạn) ====
    @Prop({ type: Object })
    createdBy: {
        _id: Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object })
    updatedBy: {
        _id: Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object })
    deletedBy: {
        _id: Types.ObjectId;
        email: string;
    };

    @Prop() createdAt: Date;
    @Prop() updatedAt: Date;
    @Prop() isDeleted: Date;
    @Prop() deletedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// ----- Virtual: children -----
CategorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent',
    justOne: false,
});

// ----- Indexes hữu ích -----
CategorySchema.index({ parent: 1, sortOrder: 1 });
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ name: 'text', slug: 'text' });

// ----- Hooks: tự tính ancestors & depth khi tạo/cập nhật parent -----
CategorySchema.pre('save', async function (next) {
    const doc = this as CategoryDocument;

    if (!doc.isModified('parent')) return next();

    if (doc.parent) {
        const ParentModel = (doc.constructor as Model<CategoryDocument>);
        const parent = await ParentModel.findById(doc.parent).lean();
        if (!parent) return next(new Error('Parent category not found'));
        doc.ancestors = [...(parent.ancestors || []), parent._id as Types.ObjectId];
        doc.depth = (parent.depth || 0) + 1;
    } else {
        doc.ancestors = [];
        doc.depth = 0;
    }

    next();
});

// Trường hợp cập nhật qua findOneAndUpdate
CategorySchema.pre('findOneAndUpdate', async function (next) {
    const update: any = this.getUpdate() || {};
    if (!('parent' in update)) return next();

    const ModelAny = this.model as Model<CategoryDocument>;
    const doc = await ModelAny.findOne(this.getQuery());
    if (!doc) return next();

    // Tính lại ancestors/depth cho chính node
    if (update.parent) {
        const parent = await ModelAny.findById(update.parent).lean();
        if (!parent) return next(new Error('Parent category not found'));
        update.ancestors = [...(parent.ancestors || []), parent._id];
        update.depth = (parent.depth || 0) + 1;
    } else {
        update.ancestors = [];
        update.depth = 0;
    }

    // Nếu đổi parent, cần cập nhật lại subtree (con cháu)
    // => tuỳ nhu cầu, bạn có thể chạy 1 job async để cập nhật hàng loạt descendants.
    this.setUpdate(update);
    next();
});
