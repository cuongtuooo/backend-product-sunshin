import { IsArray, IsEmpty, IsMongoId, IsNotEmpty } from "class-validator";

export class CreateRoleDto {
    @IsNotEmpty({ message:'name không được để trống'})
    name: string;

    @IsNotEmpty({ message: 'description không được để trống' })
    description: string;

    @IsNotEmpty({ message: 'isActive không được để trống' })
    isActive: string;

    @IsNotEmpty({ message: 'permissions không được để trống' })
    @IsMongoId({ each: true, message:"each permission là monggo object id"})
    @IsArray({ message:"permission phải có định dạng là aray"})
    permissions: string;
}
