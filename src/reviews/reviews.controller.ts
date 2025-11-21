import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ReviewService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { IUser } from 'src/users/users.interface';
import { User, ResponseMessage, Public } from 'src/decorator/customize';

@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @ResponseMessage("Tạo đánh giá sản phẩm")
    create(@Body() dto: CreateReviewDto, @User() user: IUser) {
        return this.reviewService.create(dto, user);
    }

    @Public()
    @Get()
    @ResponseMessage("Danh sách đánh giá theo sản phẩm")
    getByProduct(@Query('productId') productId: string) {
        return this.reviewService.getByProduct(productId);
    }
}
