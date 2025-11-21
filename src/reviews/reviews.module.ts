import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Product, ProductSchema } from 'src/products/schemas/products.schemas';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Review.name, schema: ReviewSchema },
            { name: Product.name, schema: ProductSchema }
        ]),
    ],
    controllers: [ReviewController],
    providers: [ReviewService],
})
export class ReviewModule { }
