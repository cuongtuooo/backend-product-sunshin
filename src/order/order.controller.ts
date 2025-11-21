import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @ResponseMessage('Create new Order')
  create(@Body() createOrderDto: CreateOrderDto, @User() user: IUser) {
    return this.orderService.create(createOrderDto, user);
  }

  @Get()
  @ResponseMessage('List all orders (with pagination)')
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query() qs: any,
  ) {
    return this.orderService.findAll(+current, +pageSize, qs);
  }

  @Get(':id')
  @ResponseMessage('Get order detail')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  // Cập nhật trạng thái đơn: dùng cho cả user & admin
  @Patch(':id/status')
  @ResponseMessage('Update order status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @User() user: IUser,
  ) {
    return this.orderService.updateStatus(id, dto, user);
  }

  // User hủy đơn khi đang pending
  @Post(':id/cancel')
  @ResponseMessage('Cancel order')
  cancelOrder(@Param('id') id: string, @User() user: IUser) {
    return this.orderService.cancelOrder(id, user);
  }
}
