import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Product } from 'src/products/schemas/products.schemas';
import { User } from 'src/users/schemas/user.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name, required: true })
    productId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true })
    content: string; // Nội dung đánh giá

    @Prop()
    rating?: number; // Nếu muốn thêm sao (1-5), optional

    @Prop({
        type: Object,
        required: true,
    })
    userInfo: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
