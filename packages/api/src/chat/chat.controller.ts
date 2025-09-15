// src/chat/chat.controller.ts
import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '../../generated/prisma';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getUserConversations(@GetUser('id') userId: number) {
    return this.chatService.getUserConversations(userId);
  }

  @Get('conversations/:id/messages')
  getConversationMessages(@Param('id', ParseIntPipe) id: number) {
    // We should add authorization here later to ensure the user is part of the convo
    return this.chatService.getConversationMessages(id);
  }

  @Post('conversations')
  createConversation(
    @GetUser('id') userId: number,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.findOrCreateConversation(userId, dto.recipientId);
  }
}
