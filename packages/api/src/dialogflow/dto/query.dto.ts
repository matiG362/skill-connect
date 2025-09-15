// src/dialogflow/dto/query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class QueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;
}
