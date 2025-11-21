import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsMongoId, IsOptional } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @IsOptional()
    @IsMongoId({ message: 'parentId phải là ObjectId hợp lệ' })
    parentId?: string | null; // cho phép null để đưa node về root
}