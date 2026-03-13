import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMyConversations(userId: string, role: string) {
    const where =
      role === 'PATIENT' ? { patient: { userId } } : { doctor: { userId } };

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

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const ok = await this.canAccessConversation(userId, conversationId);
    if (!ok) throw new ForbiddenException();

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

  async createOrGetConversation(
    patientUserId: string,
    doctorId: string,
    appointmentId?: string,
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const existing = await this.prisma.conversation.findFirst({
      where: {
        patientId: patient.id,
        doctorId,
        ...(appointmentId && { appointmentId }),
      },
    });
    if (existing) return existing;

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

  async createMessage(
    senderId: string,
    conversationId: string,
    text: string,
    fileUrl?: string,
  ) {
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

  async markMessagesRead(userId: string, conversationId: string) {
    return this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async canAccessConversation(userId: string, conversationId: string): Promise<boolean> {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { patient: true, doctor: true },
    });
    if (!conv) return false;
    return conv.patient.userId === userId || conv.doctor.userId === userId;
  }

  async getConversation(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });
  }

  async endConversation(conversationId: string, userId: string) {
    const ok = await this.canAccessConversation(userId, conversationId);
    if (!ok) throw new ForbiddenException();
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'ENDED' },
    });
  }
}