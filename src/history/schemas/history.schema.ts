// src/history/schemas/history.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Order } from 'src/order/schemas/order.schema';

export type HistoryDocument = HydratedDocument<History>;

@Schema({ timestamps: true })
export class History {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Order.name, required: true })
    orderId: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true })
    action: 'CREATE' | 'UPDATE' | 'DELETE'; // có thể mở rộng sau

    @Prop()
    description?: string; // ví dụ: "Cập nhật thông tin địa chỉ giao hàng"

    @Prop({
        type: Object,
        required: true,
    })
    user: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop()
    createdAt: Date;
}

export const HistorySchema = SchemaFactory.createForClass(History);
