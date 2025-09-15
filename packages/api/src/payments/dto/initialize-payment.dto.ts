// src/payments/dto/initialize-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class InitializePaymentDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;
}
