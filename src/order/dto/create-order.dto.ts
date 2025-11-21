import {
    IsArray,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderDetailDto {
    @IsMongoId({ message: '_id phải là ObjectId của Product' })
    _id: string;

    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'quantity phải là số' })
    quantity: number;

    @IsNotEmpty({ message: 'productName không được để trống' })
    @IsString()
    productName: string;
}

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    type: string; // COD, banking,...

    @IsOptional()
    @IsString()
    paymentStatus?: string;

    @IsOptional()
    @IsString()
    paymentRef?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderDetailDto)
    detail: OrderDetailDto[];

    @IsNotEmpty()
    @IsNumber()
    totalPrice: number;
}
