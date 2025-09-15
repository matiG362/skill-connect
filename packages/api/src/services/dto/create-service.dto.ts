import { IsNotEmpty, IsNumber, IsString, Min, IsLatitude, IsLongitude } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateServiceDto {
  @ApiProperty({ example: 'Professional Dog Walking' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '30-minute walks for your furry friend.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 25.50 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 40.7128 }) // Example for New York City
  @IsLatitude() // A built-in validator to ensure it's a valid latitude
  lat: number;

  @ApiProperty({ example: -74.0060 }) // Example for New York City
  @IsLongitude() // A built-in validator to ensure it's a valid longitude
  lon: number;
}
