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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyConversations(userId, role) {
        const where = role === 'PATIENT' ? { patient: { userId } } : { doctor: { userId } };
        return this.prisma.conversation.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                patient: {
                    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
                },
                doctor: {
                    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
                },
                messages: { take: 1, orderBy: { sentAt: 'desc' } },
                _count: {
                    select: {
                        messages: { where: { isRead: false, sender: { NOT: { id: userId } } } },
                    },
                },
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
                include: {
                    sender: {
                        select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
                    },
                },
            }),
            this.prisma.message.count({ where: { conversationId } }),
        ]);
        return { messages, total, page, limit };
    }
    async createOrGetConversation(patientUserId, doctorId, appointmentId) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        const existing = await this.prisma.conversation.findFirst({
            where: {
                patientId: patient.id,
                doctorId,
                ...(appointmentId && { appointmentId }),
            },
        });
        if (existing)
            return existing;
        return this.prisma.conversation.create({
            data: { patientId: patient.id, doctorId, appointmentId },
            include: {
                patient: {
                    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
                },
                doctor: {
                    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
                },
            },
        });
    }
    async createMessage(senderId, conversationId, text, fileUrl) {
        const msg = await this.prisma.message.create({
            data: { conversationId, senderId, text, fileUrl },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
                },
            },
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
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
        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: { status: 'ENDED' },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map