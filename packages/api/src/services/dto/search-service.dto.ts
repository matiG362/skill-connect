// src/services/dto/search-service.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchServiceDto {
  @ApiProperty({
    description: 'Latitude of the search center point.',
    example: 40.7128,
  })
  @IsLatitude()
  @Type(() => Number) // Transform incoming string from query to a number
  lat: number;

  @ApiProperty({
    description: 'Longitude of the search center point.',
    example: -74.0060,
  })
  @IsLongitude()
  @Type(() => Number)
  lon: number;

  @ApiProperty({
    description: 'Search radius in kilometers.',
    example: 5,
    required: false, // This field is optional
  })
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  @Type(() => Number)
  radius: number = 10; // Default to 10km if not provided
}
