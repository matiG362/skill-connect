// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Get all conversations for a specific user
  async getUserConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: {
        users: { some: { id: userId } },
      },
      include: {
        users: true, // Include participant info
        messages: { // Include the last message for a preview
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  // Get all messages for a specific conversation
  async getConversationMessages(conversationId: number) {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: true }, // Include sender info
      orderBy: { createdAt: 'asc' },
    });
  }

  // Find or create a conversation between two users
  async findOrCreateConversation(userId1: number, userId2: number) {
    // Find an existing conversation with both users
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { users: { some: { id: userId1 } } },
          { users: { some: { id: userId2 } } },
        ],
      },
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          users: {
            connect: [{ id: userId1 }, { id: userId2 }],
          },
        },
      });
    }

    return conversation;
  }
  async createMessage(conversationId: number, senderId: number, body: string) {
    return this.prisma.message.create({
      data: {
        body,
        conversationId,
        senderId,
      },
      include: {
        sender: { // Include sender's public info
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }
}
