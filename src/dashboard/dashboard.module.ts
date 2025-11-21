import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { Order, OrderSchema } from 'src/order/schemas/order.schema';
import { Dashboard, DashboardSchema } from './schemas/dashboard.schemas';
import { Product, ProductSchema } from 'src/products/schemas/products.schemas';
import { Category, CategorySchema } from 'src/category/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dashboard.name, schema: DashboardSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Category.name, schema: CategorySchema }
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule { }
