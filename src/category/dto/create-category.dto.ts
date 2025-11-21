import { IsNotEmpty, IsOptional, IsString, IsMongoId, IsBoolean, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'name không được để trống' })
    @IsString({ message: 'name phải là chuỗi' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    name: string;

    // Cho phép bỏ trống: "" -> undefined (backend tự sinh)
    @IsOptional()
    @IsString({ message: 'slug phải là chuỗi' })
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;
        const v = value.trim();
        return v === '' ? undefined : v;
    })
    slug?: string;

    // parentId cho phép bỏ trống: "" -> undefined
    @IsOptional()
    @IsMongoId({ message: 'parentId phải là ObjectId hợp lệ' })
    @Transform(({ value }) => {
        if (value === '' || value === undefined) return undefined;
        return value;
    })
    parentId?: string;

    @IsOptional()
    @IsString({ message: 'icon phải là chuỗi' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    icon?: string;

    @IsOptional()
    @IsString({ message: 'description phải là chuỗi' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    description?: string;

    @IsOptional()
    @IsInt({ message: 'sortOrder phải là số nguyên' })
    @Min(0, { message: 'sortOrder phải >= 0' })
    sortOrder?: number;

    @IsOptional()
    @IsBoolean({ message: 'isActive phải là true/false' })
    isActive?: boolean;
}
