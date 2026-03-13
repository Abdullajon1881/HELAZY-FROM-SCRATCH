import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    private config;
    server: Server;
    private readonly logger;
    private onlineUsers;
    constructor(chatService: ChatService, config: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    joinConversation(client: Socket, data: {
        conversationId: string;
    }): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    sendMessage(client: Socket, data: {
        conversationId: string;
        text: string;
        fileUrl?: string;
    }): Promise<({
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatar: string;
        };
    } & {
        id: string;
        text: string;
        fileUrl: string | null;
        fileName: string | null;
        fileType: string | null;
        isRead: boolean;
        readAt: Date | null;
        sentAt: Date;
        conversationId: string;
        senderId: string;
    }) | {
        error: string;
    }>;
    markRead(client: Socket, data: {
        conversationId: string;
    }): Promise<void>;
    handleTypingStart(client: Socket, data: {
        conversationId: string;
    }): void;
    handleTypingStop(client: Socket, data: {
        conversationId: string;
    }): void;
    isUserOnline(userId: string): boolean;
}
