import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { DoctorApplicationStatus, Prisma } from '@prisma/client';

interface DoctorFilterQuery {
  specialty?: string;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  language?: string;
  isAvailable?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable()
export class DoctorsService {
  private readonly logger = new Logger(DoctorsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: DoctorFilterQuery = {}) {
    const {
      specialty, minRating, maxPrice, minPrice, language,
      isAvailable, search, sortBy = 'rating', sortOrder = 'desc',
      page = 1, limit = 12,
    } = query;

    const where: Prisma.DoctorWhereInput = {
      applicationStatus: DoctorApplicationStatus.APPROVED,
    };

    if (specialty) where.specialty = { contains: specialty, mode: 'insensitive' };
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (minRating) where.rating = { gte: minRating };
    if (maxPrice || minPrice) {
      where.price = {};
      if (maxPrice) (where.price as any).lte = maxPrice;
      if (minPrice) (where.price as any).gte = minPrice;
    }
    if (language) where.languages = { has: language };
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { specialty: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.DoctorOrderByWithRelationInput =
      sortBy === 'price' ? { price: sortOrder } :
      sortBy === 'experience' ? { experience: sortOrder } :
      sortBy === 'consultations' ? { consultationCount: sortOrder } :
      { rating: sortOrder };

    const [data, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true, email: true } },
        },
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return {
      data: data.map(this.formatDoctor),
      total, page, limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true, email: true, phone: true } },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        reviews: {
          take: 5, orderBy: { createdAt: 'desc' },
          include: { appointment: { include: { patient: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } } } } },
        },
      },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return this.formatDoctor(doctor);
  }

  async getMyProfile(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true, email: true, phone: true } },
        schedules: true,
        _count: { select: { appointments: true, reviews: true } },
      },
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return doctor;
  }

  async updateMyProfile(userId: string, data: Partial<any>) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const { firstName, lastName, phone, avatar, ...doctorData } = data;

    const [updated] = await Promise.all([
      this.prisma.doctor.update({ where: { id: doctor.id }, data: doctorData }),
      (firstName || lastName || phone || avatar) && this.prisma.user.update({
        where: { id: userId },
        data: { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(phone && { phone }), ...(avatar && { avatar }) },
      }),
    ]);

    return updated;
  }

  async setAvailability(userId: string, isAvailable: boolean) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundException();
    return this.prisma.doctor.update({ where: { id: doctor.id }, data: { isAvailable } });
  }

  async getSchedule(doctorId: string) {
    return this.prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateSchedule(userId: string, slots: any[]) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundException();

    await this.prisma.doctorSchedule.deleteMany({ where: { doctorId: doctor.id } });
    return this.prisma.doctorSchedule.createMany({
      data: slots.map((s) => ({ ...s, doctorId: doctor.id })),
    });
  }

  async getAvailableSlots(doctorId: string, date: string) {
    const d = new Date(date);
    const dayOfWeek = d.getDay();

    const schedule = await this.prisma.doctorSchedule.findFirst({
      where: { doctorId, dayOfWeek, isAvailable: true },
    });
    if (!schedule) return [];

    // Parse schedule to generate 30-min slots
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    const slots: string[] = [];

    for (let m = startMins; m < endMins; m += schedule.slotDuration) {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      slots.push(`${h}:${min}`);
    }

    // Remove booked slots
    const booked = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: new Date(d.setHours(0, 0, 0, 0)),
          lt: new Date(d.setHours(23, 59, 59, 999)),
        },
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    const bookedTimes = booked.map((a) => {
      const t = new Date(a.scheduledAt);
      return `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
    });

    return slots.filter((s) => !bookedTimes.includes(s));
  }

  async getReviews(doctorId: string, page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.doctorReview.findMany({
        where: { doctorId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          appointment: {
            include: {
              patient: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
            },
          },
        },
      }),
      this.prisma.doctorReview.count({ where: { doctorId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async applyAsDoctor(userId: string, data: any) {
    const existing = await this.prisma.doctor.findUnique({ where: { userId } });
    if (existing) {
      return this.prisma.doctor.update({ where: { userId }, data: { ...data, applicationStatus: 'PENDING' } });
    }
    return this.prisma.doctor.create({ data: { ...data, userId } });
  }

  private formatDoctor(doc: any) {
    const { user, ...rest } = doc;
    return {
      ...rest,
      firstName: user?.firstName,
      lastName: user?.lastName,
      avatar: user?.avatar,
      email: user?.email,
      phone: user?.phone,
    };
  }
}
