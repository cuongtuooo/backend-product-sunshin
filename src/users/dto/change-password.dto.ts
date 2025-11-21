import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @IsNotEmpty({ message:"email không được để trống"})
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
    oldpass: string;

    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    newpass: string;
}
