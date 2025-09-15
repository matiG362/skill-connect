// src/chat/dto/create-conversation.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateConversationDto {
  @IsNumber()
  @IsNotEmpty()
  recipientId: number;
}
