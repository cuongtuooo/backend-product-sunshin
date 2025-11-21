import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DashboardDocument = HydratedDocument<Dashboard>;

@Schema({ timestamps: true })
export class Dashboard {
    @Prop({ default: () => new Date(), required: true })
    date: Date;

    @Prop({ required: true })
    totalProducts: number;

    @Prop({ required: true })
    totalOrders: number;

    @Prop({ required: true })
    totalRevenue: number;

    @Prop()
    note?: string; // bạn có thể thêm ghi chú nếu cần
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard);
