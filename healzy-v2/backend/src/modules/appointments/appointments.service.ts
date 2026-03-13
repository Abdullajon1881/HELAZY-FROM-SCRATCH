import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/database/prisma.service';
import { AppointmentStatus, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private prisma: PrismaService,
    private events: EventEmitter2,
  ) {}

  async create(userId: string, dto: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const doctor = await this.prisma.doctor.findUnique({ where: { id: dto.doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (!doctor.isAvailable) throw new BadRequestException('Doctor is not available');

    // Check for slot conflicts
    const scheduledAt = new Date(dto.scheduledAt);
    const endAt = new Date(scheduledAt.getTime() + (dto.duration || 30) * 60000);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        doctorId: dto.doctorId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        scheduledAt: { gte: scheduledAt, lt: endAt },
      },
    });
    if (conflict) throw new BadRequestException('This time slot is already booked');

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: dto.doctorId,
        type: dto.type || 'VIDEO',
        status: AppointmentStatus.PENDING,
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

  async findAll(userId: string, role: UserRole, query: any = {}) {
    const { status, type, from, to, page = 1, limit = 10 } = query;

    let patientId: string | undefined;
    let doctorId: string | undefined;

    if (role === UserRole.PATIENT) {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      patientId = patient?.id;
    } else if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
      doctorId = doctor?.id;
    }

    const where: Prisma.AppointmentWhereInput = {
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

  async findOne(id: string, userId: string, role: UserRole) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: this.appointmentIncludes(),
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    await this.checkAccess(appt, userId, role);
    return appt;
  }

  async confirm(id: string, userId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new ForbiddenException();
    const appt = await this.findOrThrow(id);
    if (appt.doctorId !== doctor.id) throw new ForbiddenException();
    if (appt.status !== AppointmentStatus.PENDING) throw new BadRequestException('Only pending appointments can be confirmed');

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED },
      include: this.appointmentIncludes(),
    });
    this.events.emit('appointment.confirmed', updated);
    return updated;
  }

  async cancel(id: string, userId: string, role: UserRole, reason?: string) {
    const appt = await this.findOrThrow(id);
    await this.checkAccess(appt, userId, role);

    if (!['PENDING', 'CONFIRMED'].includes(appt.status)) {
      throw new BadRequestException('This appointment cannot be cancelled');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED, cancelReason: reason },
      include: this.appointmentIncludes(),
    });
    this.events.emit('appointment.cancelled', updated);
    return updated;
  }

  async complete(id: string, userId: string, body: any) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new ForbiddenException();
    const appt = await this.findOrThrow(id);
    if (appt.doctorId !== doctor.id) throw new ForbiddenException();

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.COMPLETED,
        notes: body.notes,
        prescription: body.prescription,
        diagnosis: body.diagnosis,
      },
      include: this.appointmentIncludes(),
    });

    // Increment consultation count
    await this.prisma.doctor.update({
      where: { id: doctor.id },
      data: { consultationCount: { increment: 1 } },
    });

    this.events.emit('appointment.completed', updated);
    return updated;
  }

  async reschedule(id: string, userId: string, role: UserRole, scheduledAt: string) {
    const appt = await this.findOrThrow(id);
    await this.checkAccess(appt, userId, role);
    return this.prisma.appointment.update({
      where: { id },
      data: { scheduledAt: new Date(scheduledAt), status: AppointmentStatus.PENDING },
    });
  }

  async getUpcoming(userId: string, role: UserRole) {
    let where: any = { scheduledAt: { gte: new Date() }, status: { in: ['PENDING', 'CONFIRMED'] } };

    if (role === UserRole.PATIENT) {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      where.patientId = patient?.id;
    } else if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
      where.doctorId = doctor?.id;
    }

    return this.prisma.appointment.findMany({
      where, take: 5, orderBy: { scheduledAt: 'asc' },
      include: this.appointmentIncludes(),
    });
  }

  async getStats(userId: string, role: UserRole) {
    if (role === UserRole.PATIENT) {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      if (!patient) return {};
      const [total, upcoming, completed] = await Promise.all([
        this.prisma.appointment.count({ where: { patientId: patient.id } }),
        this.prisma.appointment.count({ where: { patientId: patient.id, status: { in: ['PENDING', 'CONFIRMED'] }, scheduledAt: { gte: new Date() } } }),
        this.prisma.appointment.count({ where: { patientId: patient.id, status: 'COMPLETED' } }),
      ]);
      return { total, upcoming, completed };
    }
    if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) return {};
      const [total, today, rating] = await Promise.all([
        this.prisma.appointment.count({ where: { doctorId: doctor.id } }),
        this.prisma.appointment.count({ where: { doctorId: doctor.id, scheduledAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lt: new Date(new Date().setHours(23, 59, 59, 999)) } } }),
        this.prisma.doctorReview.aggregate({ where: { doctorId: doctor.id }, _avg: { rating: true } }),
      ]);
      return { total, today, rating: rating._avg.rating || 0, consultationCount: doctor.consultationCount };
    }
    return {};
  }

  private async findOrThrow(id: string) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new NotFoundException('Appointment not found');
    return appt;
  }

  private async checkAccess(appt: any, userId: string, role: UserRole) {
    if (role === UserRole.ADMIN) return;
    if (role === UserRole.PATIENT) {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      if (appt.patientId !== patient?.id) throw new ForbiddenException();
    }
    if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
      if (appt.doctorId !== doctor?.id) throw new ForbiddenException();
    }
  }

  private appointmentIncludes() {
    return {
      patient: { include: { user: { select: { firstName: true, lastName: true, avatar: true, email: true } } } },
      doctor: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
      payment: true,
    };
  }
}
