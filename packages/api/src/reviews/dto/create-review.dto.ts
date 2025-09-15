// src/reviews/dto/create-review.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ example: 'Great service, very professional!', required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: 'The ID of the service being reviewed' })
  @IsInt()
  @IsNotEmpty()
  serviceId: number;
}
