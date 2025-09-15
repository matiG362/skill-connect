// src/chat/chat.gateway.ts

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins — can restrict later
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  /** ---------------------------
   *  Handle socket connection
   * --------------------------- */
  handleConnection(client: Socket) {
    console.log(`[WebSocket] Client connected: ${client.id}`);
  }

  /** ---------------------------
   *  Handle socket disconnection
   * --------------------------- */
  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Client disconnected: ${client.id}`);
  }

  /** ---------------------------
   *  Join a chat conversation room
   * --------------------------- */
 @SubscribeMessage('joinRoom')
handleJoinRoom(client: Socket, room: string): void {
  client.join(room);
  console.log(`[WebSocket] Client ${client.id} joined room: ${room}`);
}

  /** ---------------------------
   *  Join a payment transaction room ✅ NEW
   * --------------------------- */
  @SubscribeMessage('joinTransactionRoom')
  handleJoinTransactionRoom(client: Socket, tx_ref: string): void {
  const roomName = `transaction_${tx_ref}`;
  client.join(roomName);
  console.log(`✅ Client ${client.id} joined TRANSACTION ROOM: ${roomName}`);
  client.emit('joinedTransactionRoom', roomName); // <-- confirmation
}


  /** ---------------------------
   *  Send a chat message
   * --------------------------- */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { conversationId: number; senderId: number; body: string },
  ): Promise<void> {
    const { conversationId, senderId, body } = payload;

    // 1. Save message in the database
    const newMessage = await this.chatService.createMessage(conversationId, senderId, body);

    // 2. Broadcast to conversation room
    const roomName = `conversation_${conversationId}`;
    this.server.to(roomName).emit('newMessage', newMessage);

    console.log(`[WebSocket] New message sent to room: ${roomName}`);
  }
}
