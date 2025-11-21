import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
    @IsNotEmpty()
    @IsString()
    @IsIn([
        'pending',
        'shipping',
        'delivered',
        'completed',
        'returned-request',
        'returned-completed',
        'canceled',
    ])
    status: string;
}
