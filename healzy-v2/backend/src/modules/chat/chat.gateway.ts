import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private onlineUsers = new Map<string, string>();

  constructor(
    private chatService: ChatService,
    private config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) { client.disconnect(); return; }

      const payload: any = jwt.verify(token, this.config.get('JWT_SECRET'));
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      this.onlineUsers.set(payload.sub, client.id);
      client.broadcast.emit('user:online', { userId: payload.sub });
      client.join(`user:${payload.sub}`);
      this.logger.log(`Connected: ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.onlineUsers.delete(userId);
      client.broadcast.emit('user:offline', { userId });
    }
  }

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const ok = await this.chatService.canAccessConversation(client.data.userId, data.conversationId);
    if (!ok) return { error: 'Access denied' };
    client.join(`conv:${data.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; text: string; fileUrl?: string },
  ) {
    const ok = await this.chatService.canAccessConversation(client.data.userId, data.conversationId);
    if (!ok) return { error: 'Access denied' };

    const message = await this.chatService.createMessage(
      client.data.userId,
      data.conversationId,
      data.text,
      data.fileUrl,
    );

    this.server.to(`conv:${data.conversationId}`).emit('message:new', message);
    return message;
  }

  @SubscribeMessage('message:read')
  async markRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    await this.chatService.markMessagesRead(client.data.userId, data.conversationId);
    this.server.to(`conv:${data.conversationId}`).emit('messages:read', {
      conversationId: data.conversationId,
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.to(`conv:${data.conversationId}`).emit('typing:start', { userId: client.data.userId });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.to(`conv:${data.conversationId}`).emit('typing:stop', { userId: client.data.userId });
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}