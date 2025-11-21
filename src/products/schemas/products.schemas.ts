import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
    @Prop()
    name: string;

    @Prop()
    thumbnail: string;

    @Prop()
    slider: string[];

    @Prop()
    mainText: string;

    @Prop()
    desc: string;

    @Prop()
    price: number;

    @Prop()
    sold: number;

    @Prop()
    quantity: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true }) 
    category: mongoose.Schema.Types.ObjectId;

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: Date;

    @Prop()
    deletedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
