// src/payments/dto/direct-charge.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Length, IsIn } from 'class-validator';

// Define the allowed payment methods
const allowedPaymentMethods = ['telebirr', 'cbebirr'];

export class DirectChargeDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;

  @ApiProperty({ example: '0912345678' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, { message: 'Phone number must be 10 digits' })
  phoneNumber: string;

  // --- ADD THIS NEW FIELD ---
  @ApiProperty({ enum: allowedPaymentMethods, example: 'telebirr' })
  @IsIn(allowedPaymentMethods) // Ensure only valid methods are sent
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
