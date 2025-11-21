import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/category/schemas/category.schema';
import { Product, ProductSchema } from './schemas/products.schemas';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Product.name, schema: ProductSchema },
    { name: Category.name, schema: CategorySchema}
  ])],
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule {}
