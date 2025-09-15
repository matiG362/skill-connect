// packages/api/src/services/dto/update-service.dto.ts
import { ApiProperty } from '@nestjs/swagger';
// Add IsLatitude, IsLongitude
import { IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateServiceDto {
  @ApiProperty({ required: false }) @IsString() @IsOptional() title?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsNumber() @Min(0) @IsOptional() price?: number;

  // --- ADD THESE ---
  @ApiProperty({ required: false }) @IsLatitude() @IsOptional() lat?: number;
  @ApiProperty({ required: false }) @IsLongitude() @IsOptional() lon?: number;
}
