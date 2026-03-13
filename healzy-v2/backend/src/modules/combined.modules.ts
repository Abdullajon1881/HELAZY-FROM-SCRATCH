import {
  Injectable, NotFoundException, ForbiddenException,
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Module, Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '@/database/prisma.service';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '@/common/guards';
import { UserRole, DoctorApplicationStatus } from '@prisma/client';

// ══════════════════════════════════════════════════════════════════════════════
// REVIEWS
// ══════════════════════════════════════════════════════════════════════════════
@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: { appointmentId: string; rating: number; comment?: string }) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const appt = await this.prisma.appointment.findUnique({ where: { id: dto.appointmentId } });
    if (!appt) throw new NotFoundException('Appointment not found');
    if (appt.patientId !== patient.id) throw new ForbiddenException();
    if (appt.status !== 'COMPLETED') throw new ForbiddenException('Can only review completed appointments');

    const existing = await this.prisma.doctorReview.findUnique({ where: { appointmentId: dto.appointmentId } });
    if (existing) throw new ForbiddenException('Already reviewed this appointment');

    const review = await this.prisma.doctorReview.create({
      data: {
        doctorId: appt.doctorId,
        patientId: patient.id,
        appointmentId: dto.appointmentId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    // Recalculate doctor rating
    const agg = await this.prisma.doctorReview.aggregate({
      where: { doctorId: appt.doctorId },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.doctor.update({
      where: { id: appt.doctorId },
      data: { rating: agg._avg.rating || 0, reviewCount: agg._count },
    });

    return review;
  }
}

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private svc: ReviewsService) {}

  @Post()
  create(@CurrentUser() u: any, @Body() body: any) {
    return this.svc.create(u.id, body);
  }
}

@Module({ controllers: [ReviewsController], providers: [ReviewsService] })
export class ReviewsModule {}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const [data, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { data, total, unread, page, limit };
  }

  async markRead(userId: string, id?: string) {
    if (id) {
      const n = await this.prisma.notification.findFirst({ where: { id, userId } });
      if (!n) throw new NotFoundException();
      return this.prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
    }
    return this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
  }

  async create(userId: string, type: string, title: string, body: string, data?: any) {
    return this.prisma.notification.create({ data: { userId, type: type as any, title, body, data } });
  }
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  getAll(@CurrentUser() u: any, @Query('page') p = 1) {
    return this.svc.getMyNotifications(u.id, +p);
  }

  @Patch('read-all')
  readAll(@CurrentUser() u: any) {
    return this.svc.markRead(u.id);
  }

  @Patch(':id/read')
  readOne(@Param('id') id: string, @CurrentUser() u: any) {
    return this.svc.markRead(u.id, id);
  }
}

@Module({ controllers: [NotificationsController], providers: [NotificationsService], exports: [NotificationsService] })
export class NotificationsModule {}

// ══════════════════════════════════════════════════════════════════════════════
// PAYMENTS
// ══════════════════════════════════════════════════════════════════════════════
@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPaymentIntent(userId: string, appointmentId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    const appt = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt || appt.patientId !== patient?.id) throw new ForbiddenException();

    const payment = await this.prisma.payment.upsert({
      where: { appointmentId },
      create: { appointmentId, amount: appt.amount, currency: appt.currency, status: 'PENDING' },
      update: {},
    });

    // TODO: integrate Stripe — return clientSecret
    return { paymentId: payment.id, amount: payment.amount, currency: payment.currency, clientSecret: 'pi_mock_secret' };
  }

  async confirmPayment(paymentId: string) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED' },
    });
    await this.prisma.appointment.update({
      where: { id: payment.appointmentId },
      data: { isPaid: true },
    });
    return payment;
  }

  async getMyPayments(userId: string, role: string) {
    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      return this.prisma.payment.findMany({
        where: { appointment: { patientId: patient?.id } },
        include: { appointment: { include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    return [];
  }
}

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private svc: PaymentsService) {}

  @Post('intent')
  createIntent(@CurrentUser() u: any, @Body('appointmentId') id: string) {
    return this.svc.createPaymentIntent(u.id, id);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.svc.confirmPayment(id);
  }

  @Get()
  getMyPayments(@CurrentUser() u: any) {
    return this.svc.getMyPayments(u.id, u.role);
  }
}

@Module({ controllers: [PaymentsController], providers: [PaymentsService] })
export class PaymentsModule {}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════════════════════
@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [users, doctors, patients, appointments, revenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.doctor.count({ where: { applicationStatus: 'APPROVED' } }),
      this.prisma.patient.count(),
      this.prisma.appointment.count(),
      this.prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    ]);
    return { users, doctors, patients, appointments, revenue: revenue._sum.amount || 0 };
  }

  async getDoctorApplications(status?: string) {
    return this.prisma.doctor.findMany({
      where: { applicationStatus: (status?.toUpperCase() as any) || 'PENDING' },
      include: { user: { select: { firstName: true, lastName: true, email: true, avatar: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveDoctor(doctorId: string, note?: string) {
    const doctor = await this.prisma.doctor.update({
      where: { id: doctorId },
      data: { applicationStatus: DoctorApplicationStatus.APPROVED, isVerified: true, applicationNote: note },
    });
    // TODO: send approval email notification
    return doctor;
  }

  async rejectDoctor(doctorId: string, note: string) {
    return this.prisma.doctor.update({
      where: { id: doctorId },
      data: { applicationStatus: DoctorApplicationStatus.REJECTED, applicationNote: note },
    });
  }

  async getAllUsers(page = 1, limit = 20, search?: string, role?: string) {
    const where: any = {};
    if (search) where.OR = [{ firstName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
    if (role) where.role = role.toUpperCase();

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true, avatar: true },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async toggleUserActive(userId: string, isActive: boolean) {
    return this.prisma.user.update({ where: { id: userId }, data: { isActive } });
  }

  async getRevenueChart(days = 30) {
    const from = new Date(Date.now() - days * 86400000);
    return this.prisma.payment.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: from }, status: 'COMPLETED' },
      _sum: { amount: true },
    });
  }
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private svc: AdminService) {}

  @Get('stats') getStats() { return this.svc.getStats(); }

  @Get('applications')
  getApplications(@Query('status') status?: string) { return this.svc.getDoctorApplications(status); }

  @Patch('doctors/:id/approve')
  approve(@Param('id') id: string, @Body('note') note?: string) { return this.svc.approveDoctor(id, note); }

  @Patch('doctors/:id/reject')
  reject(@Param('id') id: string, @Body('note') note: string) { return this.svc.rejectDoctor(id, note); }

  @Get('users')
  getUsers(@Query('page') p = 1, @Query('limit') l = 20, @Query('search') s?: string, @Query('role') r?: string) {
    return this.svc.getAllUsers(+p, +l, s, r);
  }

  @Patch('users/:id/toggle')
  toggle(@Param('id') id: string, @Body('isActive') isActive: boolean) { return this.svc.toggleUserActive(id, isActive); }

  @Get('revenue') getRevenue(@Query('days') days = 30) { return this.svc.getRevenueChart(+days); }
}

@Module({ controllers: [AdminController], providers: [AdminService] })
export class AdminModule {}

// ══════════════════════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════════════════════
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, phone: true, dateOfBirth: true, gender: true, isEmailVerified: true, createdAt: true },
    });
  }

  async updateProfile(userId: string, data: any) {
    const { firstName, lastName, phone, avatar, dateOfBirth, gender } = data;
    return this.prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone, avatar, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, gender },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, phone: true },
    });
  }
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private svc: UsersService) {}
  @Get('profile') getProfile(@CurrentUser() u: any) { return this.svc.getProfile(u.id); }
  @Patch('profile') updateProfile(@CurrentUser() u: any, @Body() body: any) { return this.svc.updateProfile(u.id, body); }
}

@Module({ controllers: [UsersController], providers: [UsersService], exports: [UsersService] })
export class UsersModule {}

// ══════════════════════════════════════════════════════════════════════════════
// PATIENTS
// ══════════════════════════════════════════════════════════════════════════════
@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    return this.prisma.patient.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true, email: true, avatar: true, phone: true } } },
    });
  }

  async updateMyProfile(userId: string, data: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    return this.prisma.patient.update({ where: { id: patient.id }, data });
  }
}

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private svc: PatientsService) {}
  @Get('me') getMe(@CurrentUser() u: any) { return this.svc.getMyProfile(u.id); }
  @Patch('me') updateMe(@CurrentUser() u: any, @Body() body: any) { return this.svc.updateMyProfile(u.id, body); }
}

@Module({ controllers: [PatientsController], providers: [PatientsService] })
export class PatientsModule {}

// ══════════════════════════════════════════════════════════════════════════════
// MEDICAL RECORDS
// ══════════════════════════════════════════════════════════════════════════════
@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async getMyRecords(userId: string, type?: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    return this.prisma.medicalRecord.findMany({
      where: { patientId: patient.id, ...(type && { type }) },
      orderBy: { date: 'desc' },
    });
  }

  async create(userId: string, data: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    return this.prisma.medicalRecord.create({ data: { ...data, patientId: patient.id, date: new Date(data.date) } });
  }

  async delete(id: string, userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    const record = await this.prisma.medicalRecord.findFirst({ where: { id, patientId: patient?.id } });
    if (!record) throw new NotFoundException();
    return this.prisma.medicalRecord.delete({ where: { id } });
  }
}

@ApiTags('Medical Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private svc: MedicalRecordsService) {}
  @Get() getAll(@CurrentUser() u: any, @Query('type') type?: string) { return this.svc.getMyRecords(u.id, type); }
  @Post() create(@CurrentUser() u: any, @Body() body: any) { return this.svc.create(u.id, body); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() u: any) { return this.svc.delete(id, u.id); }
}

@Module({ controllers: [MedicalRecordsController], providers: [MedicalRecordsService] })
export class MedicalRecordsModule {}
