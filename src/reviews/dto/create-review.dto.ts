import { IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsNotEmpty()
    productId: string;

    @IsNotEmpty()
    content: string;

    @IsOptional()
    @Min(1)
    @Max(5)
    rating?: number;
}
