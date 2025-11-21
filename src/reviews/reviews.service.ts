import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { IUser } from 'src/users/users.interface';
import { Product } from 'src/products/schemas/products.schemas';

@Injectable()
export class ReviewService {
    constructor(
        @InjectModel(Review.name)
        private reviewModel: mongoose.Model<ReviewDocument>,

        @InjectModel(Product.name)
        private productModel: mongoose.Model<Product>
    ) { }

    async create(dto: CreateReviewDto, user: IUser) {
        const { productId, content, rating } = dto;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new BadRequestException('ProductId không hợp lệ');
        }

        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new BadRequestException('Sản phẩm không tồn tại');
        }

        return await this.reviewModel.create({
            productId,
            content,
            rating: rating || null,
            userId: user._id,
            userInfo: {
                _id: user._id,
                email: user.email,
            },
        });
    }

    async getByProduct(productId: string) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new BadRequestException('productId không hợp lệ');
        }

        return await this.reviewModel
            .find({ productId })
            .sort({ createdAt: -1 })
            .lean();
    }
}
