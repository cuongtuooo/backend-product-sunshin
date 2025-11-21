import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';
import { ChangePasswordDto } from './dto/change-password.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage("Create new User")
  async create(
    // @Body("email") email: string,
    // @Body("password") password: string,
    // @Body("name") name: string
    @Body() createUserDto : CreateUserDto,
    @User() user: IUser,
  ) {
    let newUser = await this.usersService.create(createUserDto, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createAt
    }
  }

  @ResponseMessage("fetch user with paginate")
  @Get()
  findAll(
    @Query("current") currentPage: string, //const curentPage: string = req.query.page;
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage("get a user by id")
  @Get(':id')
  async findOne(@Param('id') id: string) { //const id:string = request.param.id
    const foundUser = await this.usersService.findOne(id);
    return foundUser;
  }

  @ResponseMessage("update a user")
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @User() user:IUser) {
    let updatedUser = await this.usersService.update(updateUserDto, user)
    return updatedUser;
  }

  @ResponseMessage("delete a user")
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @User() user: IUser //req.user
  ) {
    return this.usersService.remove(id, user);
  }

  @Post('change-password')
  @Public() // Nếu bạn đang dùng auth guard mặc định
  @ResponseMessage('Đổi mật khẩu bằng email')
  async changePasswordByEmail(
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.usersService.changePasswordByEmail(changePasswordDto);
  }
}
