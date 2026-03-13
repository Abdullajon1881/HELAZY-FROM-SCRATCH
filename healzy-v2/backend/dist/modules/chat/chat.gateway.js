"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const chat_service_1 = require("./chat.service");
const jwt = require("jsonwebtoken");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    constructor(chatService, config) {
        this.chatService = chatService;
        this.config = config;
        this.logger = new common_1.Logger(ChatGateway_1.name);
        this.onlineUsers = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = jwt.verify(token, this.config.get('JWT_SECRET'));
            client.data.userId = payload.sub;
            client.data.role = payload.role;
            this.onlineUsers.set(payload.sub, client.id);
            client.broadcast.emit('user:online', { userId: payload.sub });
            client.join(`user:${payload.sub}`);
            this.logger.log(`Connected: ${payload.sub}`);
        }
        catch {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            this.onlineUsers.delete(userId);
            client.broadcast.emit('user:offline', { userId });
        }
    }
    async joinConversation(client, data) {
        const ok = await this.chatService.canAccessConversation(client.data.userId, data.conversationId);
        if (!ok)
            return { error: 'Access denied' };
        client.join(`conv:${data.conversationId}`);
        return { success: true };
    }
    async sendMessage(client, data) {
        const ok = await this.chatService.canAccessConversation(client.data.userId, data.conversationId);
        if (!ok)
            return { error: 'Access denied' };
        const message = await this.chatService.createMessage(client.data.userId, data.conversationId, data.text, data.fileUrl);
        this.server.to(`conv:${data.conversationId}`).emit('message:new', message);
        return message;
    }
    async markRead(client, data) {
        await this.chatService.markMessagesRead(client.data.userId, data.conversationId);
        this.server.to(`conv:${data.conversationId}`).emit('messages:read', {
            conversationId: data.conversationId,
            userId: client.data.userId,
        });
    }
    handleTypingStart(client, data) {
        client.to(`conv:${data.conversationId}`).emit('typing:start', { userId: client.data.userId });
    }
    handleTypingStop(client, data) {
        client.to(`conv:${data.conversationId}`).emit('typing:stop', { userId: client.data.userId });
    }
    isUserOnline(userId) {
        return this.onlineUsers.has(userId);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "sendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "markRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStop", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*', credentials: true },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        config_1.ConfigService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map