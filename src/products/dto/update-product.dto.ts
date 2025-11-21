import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-Product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
