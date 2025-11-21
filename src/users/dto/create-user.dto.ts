import { Type } from 'class-transformer';
import { IsDefined, IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';


// DATA tranfer object // class = {}

export class CreateUserDto {
    @IsNotEmpty({
        message: "name không được để trống"
    })
    name: string;

    @IsEmail({},{
        message: "Email không đúng định dạng"
    })
    @IsNotEmpty({
        message:"Email không được để trống"
    })
    email: string;

    @IsNotEmpty({
        message:"Mật khẩu không được để trống"
    })
    password: string;

    @IsNotEmpty({
        message: "role không được để trống"
    })
    @IsMongoId({ message:"role có định dạng là mongoid"})
    role: mongoose.Schema.Types.ObjectId;   
}

export class RegisterUserDto {

    @IsEmail({}, {
        message: "Email không đúng định dạng"
    })
    @IsNotEmpty({
        message: "Email không được để trống"
    })
    email: string;

    @IsNotEmpty({
        message: "Mật khẩu không được để trống"
    })
    password: string;

    @IsNotEmpty({
        message: "name không được để trống"
    })
    name: string;
}
