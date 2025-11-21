import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @ResponseMessage('Create new Product')
  create(@Body() createProductDto: CreateProductDto, @User() user: IUser) {
    return this.productService.create(createProductDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Fetch list of Products')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: any
  ) {
    return this.productService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Get product detail')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update product')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: IUser
  ) {
    return this.productService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete product')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.productService.remove(id, user);
  }
}
