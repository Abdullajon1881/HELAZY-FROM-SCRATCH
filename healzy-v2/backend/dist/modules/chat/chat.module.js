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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = exports.ChatController = exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../database/prisma.service");
const chat_gateway_1 = require("./chat.gateway");
const guards_1 = require("../../common/guards");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyConversations(userId, role) {
        const where = role === 'PATIENT'
            ? { patient: { userId } }
            : { doctor: { userId } };
        return this.prisma.conversation.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                patient: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
                doctor: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
                messages: { take: 1, orderBy: { sentAt: 'desc' } },
                _count: { select: { messages: { where: { isRead: false, sender: { NOT: { id: userId } } } } } },
            },
        });
    }
    async getMessages(conversationId, userId, page = 1, limit = 50) {
        const ok = await this.canAccessConversation(userId, conversationId);
        if (!ok)
            throw new common_1.ForbiddenException();
        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: { conversationId },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { sentAt: 'asc' },
                include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
            }),
            this.prisma.message.count({ where: { conversationId } }),
        ]);
        return { messages, total, page, limit };
    }
    async createOrGetConversation(patientUserId, doctorId, appointmentId) {
        const patient = await this.prisma.patient.findUnique({ where: { userId: patientUserId } });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        const existing = await this.prisma.conversation.findFirst({
            where: { patientId: patient.id, doctorId, ...(appointmentId && { appointmentId }) },
        });
        if (existing)
            return existing;
        return this.prisma.conversation.create({
            data: { patientId: patient.id, doctorId, appointmentId },
            include: {
                patient: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
                doctor: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
            },
        });
    }
    async createMessage(senderId, conversationId, text, fileUrl) {
        const msg = await this.prisma.message.create({
            data: { conversationId, senderId, text, fileUrl },
            include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
        });
        await this.prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
        return msg;
    }
    async markMessagesRead(userId, conversationId) {
        return this.prisma.message.updateMany({
            where: { conversationId, senderId: { not: userId }, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async canAccessConversation(userId, conversationId) {
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { patient: true, doctor: true },
        });
        if (!conv)
            return false;
        return conv.patient.userId === userId || conv.doctor.userId === userId;
    }
    async getConversation(conversationId) {
        return this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } },
            },
        });
    }
    async endConversation(conversationId, userId) {
        const ok = await this.canAccessConversation(userId, conversationId);
        if (!ok)
            throw new common_1.ForbiddenException();
        return this.prisma.conversation.update({ where: { id: conversationId }, data: { status: 'ENDED' } });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
let ChatController = class ChatController {
    constructor(chat) {
        this.chat = chat;
    }
    getConversations(u) {
        return this.chat.getMyConversations(u.id, u.role);
    }
    createConversation(u, body) {
        return this.chat.createOrGetConversation(u.id, body.doctorId, body.appointmentId);
    }
    getMessages(id, u, page = 1) {
        return this.chat.getMessages(id, u.id, +page);
    }
    endConversation(id, u) {
        return this.chat.endConversation(id, u.id);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, guards_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:id/end'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "endConversation", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [ChatService])
], ChatController);
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({})],
        controllers: [ChatController],
        providers: [ChatService, chat_gateway_1.ChatGateway],
        exports: [ChatService],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map