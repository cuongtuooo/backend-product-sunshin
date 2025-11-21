import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @ResponseMessage('Create new Category')
  create(@Body() dto: CreateCategoryDto, @User() user: IUser) {
    return this.categoryService.create(dto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Fetch list of Category')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: any
  ) {
    return this.categoryService.findAll(+currentPage, +limit, qs);
  }

  // Roots: các danh mục cấp 1
  @Get('roots')
  @Public()
  @ResponseMessage('Fetch root categories')
  roots() {
    return this.categoryService.findRoots();
  }

  // Cây toàn bộ hoặc giới hạn depth
  @Get('tree')
  @Public()
  @ResponseMessage('Fetch category tree')
  tree(@Query('depth') depth?: string) {
    return this.categoryService.findTree(depth ? +depth : undefined);
  }

  // Children trực tiếp của 1 node
  @Get(':id/children')
  @Public()
  @ResponseMessage('Fetch category children')
  children(@Param('id') id: string) {
    return this.categoryService.findChildren(id);
  }

  // Breadcrumbs (tổ tiên từ root -> node)
  @Get(':id/breadcrumbs')
  @Public()
  @ResponseMessage('Fetch category breadcrumbs')
  breadcrumbs(@Param('id') id: string) {
    return this.categoryService.findBreadcrumbs(id);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Get category detail')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update category')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @User() user: IUser
  ) {
    return this.categoryService.update(id, dto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete category')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.categoryService.remove(id, user);
  }
}
