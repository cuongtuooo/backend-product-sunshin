import { Module } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';
import { ChatAiController } from './chat-ai.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/products/schemas/products.schemas';
import { Category, CategorySchema } from 'src/category/schemas/category.schema';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
            { name: Category.name, schema: CategorySchema },
            { name: Order.name, schema: OrderSchema },
        ]),
    ],
    controllers: [ChatAiController],
    providers: [ChatAiService],
})
export class ChatAiModule { }
