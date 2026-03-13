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
var AppointmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let AppointmentsService = AppointmentsService_1 = class AppointmentsService {
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
        this.logger = new common_1.Logger(AppointmentsService_1.name);
    }
    async create(userId, dto) {
        const patient = await this.prisma.patient.findUnique({ where: { userId } });
        if (!patient)
            throw new common_1.NotFoundException('Patient profile not found');
        const doctor = await this.prisma.doctor.findUnique({ where: { id: dto.doctorId } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        if (!doctor.isAvailable)
            throw new common_1.BadRequestException('Doctor is not available');
        const scheduledAt = new Date(dto.scheduledAt);
        const endAt = new Date(scheduledAt.getTime() + (dto.duration || 30) * 60000);
        const conflict = await this.prisma.appointment.findFirst({
            where: {
                doctorId: dto.doctorId,
                status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
                scheduledAt: { gte: scheduledAt, lt: endAt },
            },
        });
        if (conflict)
            throw new common_1.BadRequestException('This time slot is already booked');
        const appointment = await this.prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: dto.doctorId,
                type: dto.type || 'VIDEO',
                status: client_1.AppointmentStatus.PENDING,
                scheduledAt,
                duration: dto.duration || 30,
                reason: dto.reason,
                symptoms: dto.symptoms || [],
                amount: doctor.price,
                currency: doctor.currency,
            },
            include: this.appointmentIncludes(),
        });
        this.events.emit('appointment.created', appointment);
        return appointment;
    }
    async findAll(userId, role, query = {}) {
        const { status, type, from, to, page = 1, limit = 10 } = query;
        let patientId;
        let doctorId;
        if (role === client_1.UserRole.PATIENT) {
            const patient = await this.prisma.patient.findUnique({ where: { userId } });
            patientId = patient?.id;
        }
        else if (role === client_1.UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
            doctorId = doctor?.id;
        }
        const where = {
            ...(patientId && { patientId }),
            ...(doctorId && { doctorId }),
            ...(status && { status: status.toUpperCase() }),
            ...(type && { type: type.toUpperCase() }),
            ...(from || to ? { scheduledAt: { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) } } : {}),
        };
        const [data, total] = await Promise.all([
            this.prisma.appointment.findMany({
                where, skip: (page - 1) * limit, take: +limit,
                orderBy: { scheduledAt: 'desc' },
                include: this.appointmentIncludes(),
            }),
            this.prisma.appointment.count({ where }),
        ]);
        return { data, total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id, userId, role) {
        const appt = await this.prisma.appointment.findUnique({
            where: { id },
            include: this.appointmentIncludes(),
        });
        if (!appt)
            throw new common_1.NotFoundException('Appointment not found');
        await this.checkAccess(appt, userId, role);
        return appt;
    }
    async confirm(id, userId) {
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor)
            throw new common_1.ForbiddenException();
        const appt = await this.findOrThrow(id);
        if (appt.doctorId !== doctor.id)
            throw new common_1.ForbiddenException();
        if (appt.status !== client_1.AppointmentStatus.PENDING)
            throw new common_1.BadRequestException('Only pending appointments can be confirmed');
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { status: client_1.AppointmentStatus.CONFIRMED },
            include: this.appointmentIncludes(),
        });
        this.events.emit('appointment.confirmed', updated);
        return updated;
    }
    async cancel(id, userId, role, reason) {
        const appt = await this.findOrThrow(id);
        await this.checkAccess(appt, userId, role);
        if (!['PENDING', 'CONFIRMED'].includes(appt.status)) {
            throw new common_1.BadRequestException('This appointment cannot be cancelled');
        }
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { status: client_1.AppointmentStatus.CANCELLED, cancelReason: reason },
            include: this.appointmentIncludes(),
        });
        this.events.emit('appointment.cancelled', updated);
        return updated;
    }
    async complete(id, userId, body) {
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor)
            throw new common_1.ForbiddenException();
        const appt = await this.findOrThrow(id);
        if (appt.doctorId !== doctor.id)
            throw new common_1.ForbiddenException();
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: {
                status: client_1.AppointmentStatus.COMPLETED,
                notes: body.notes,
                prescription: body.prescription,
                diagnosis: body.diagnosis,
            },
            include: this.appointmentIncludes(),
        });
        await this.prisma.doctor.update({
            where: { id: doctor.id },
            data: { consultationCount: { increment: 1 } },
        });
        this.events.emit('appointment.completed', updated);
        return updated;
    }
    async reschedule(id, userId, role, scheduledAt) {
        const appt = await this.findOrThrow(id);
        await this.checkAccess(appt, userId, role);
        return this.prisma.appointment.update({
            where: { id },
            data: { scheduledAt: new Date(scheduledAt), status: client_1.AppointmentStatus.PENDING },
        });
    }
    async getUpcoming(userId, role) {
        let where = { scheduledAt: { gte: new Date() }, status: { in: ['PENDING', 'CONFIRMED'] } };
        if (role === client_1.UserRole.PATIENT) {
            const patient = await this.prisma.patient.findUnique({ where: { userId } });
            where.patientId = patient?.id;
        }
        else if (role === client_1.UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
            where.doctorId = doctor?.id;
        }
        return this.prisma.appointment.findMany({
            where, take: 5, orderBy: { scheduledAt: 'asc' },
            include: this.appointmentIncludes(),
        });
    }
    async getStats(userId, role) {
        if (role === client_1.UserRole.PATIENT) {
            const patient = await this.prisma.patient.findUnique({ where: { userId } });
            if (!patient)
                return {};
            const [total, upcoming, completed] = await Promise.all([
                this.prisma.appointment.count({ where: { patientId: patient.id } }),
                this.prisma.appointment.count({ where: { patientId: patient.id, status: { in: ['PENDING', 'CONFIRMED'] }, scheduledAt: { gte: new Date() } } }),
                this.prisma.appointment.count({ where: { patientId: patient.id, status: 'COMPLETED' } }),
            ]);
            return { total, upcoming, completed };
        }
        if (role === client_1.UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
            if (!doctor)
                return {};
            const [total, today, rating] = await Promise.all([
                this.prisma.appointment.count({ where: { doctorId: doctor.id } }),
                this.prisma.appointment.count({ where: { doctorId: doctor.id, scheduledAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lt: new Date(new Date().setHours(23, 59, 59, 999)) } } }),
                this.prisma.doctorReview.aggregate({ where: { doctorId: doctor.id }, _avg: { rating: true } }),
            ]);
            return { total, today, rating: rating._avg.rating || 0, consultationCount: doctor.consultationCount };
        }
        return {};
    }
    async findOrThrow(id) {
        const appt = await this.prisma.appointment.findUnique({ where: { id } });
        if (!appt)
            throw new common_1.NotFoundException('Appointment not found');
        return appt;
    }
    async checkAccess(appt, userId, role) {
        if (role === client_1.UserRole.ADMIN)
            return;
        if (role === client_1.UserRole.PATIENT) {
            const patient = await this.prisma.patient.findUnique({ where: { userId } });
            if (appt.patientId !== patient?.id)
                throw new common_1.ForbiddenException();
        }
        if (role === client_1.UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
            if (appt.doctorId !== doctor?.id)
                throw new common_1.ForbiddenException();
        }
    }
    appointmentIncludes() {
        return {
            patient: { include: { user: { select: { firstName: true, lastName: true, avatar: true, email: true } } } },
            doctor: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
            payment: true,
        };
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = AppointmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map