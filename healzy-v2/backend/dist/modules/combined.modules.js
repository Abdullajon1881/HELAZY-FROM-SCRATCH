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
exports.MedicalRecordsModule = exports.MedicalRecordsController = exports.MedicalRecordsService = exports.PatientsModule = exports.PatientsController = exports.PatientsService = exports.UsersModule = exports.UsersController = exports.UsersService = exports.AdminModule = exports.AdminController = exports.AdminService = exports.PaymentsModule = exports.PaymentsController = exports.PaymentsService = exports.NotificationsModule = exports.NotificationsController = exports.NotificationsService = exports.ReviewsModule = exports.ReviewsController = exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../database/prisma.service");
const guards_1 = require("../common/guards");
const client_1 = require("@prisma/client");
let ReviewsService = class ReviewsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const patient = await this.prisma.patient.findUnique({ where: { userId } });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        const appt = await this.prisma.appointment.findUnique({ where: { id: dto.appointmentId } });
        if (!appt)
            throw new common_1.NotFoundException('Appointment not found');
        if (appt.patientId !== patient.id)
            throw new common_1.ForbiddenException();
        if (appt.status !== 'COMPLETED')
            throw new common_1.ForbiddenException('Can only review completed appointments');
        const existing = await this.prisma.doctorReview.findUnique({ where: { appointmentId: dto.appointmentId } });
        if (existing)
            throw new common_1.ForbiddenException('Already reviewed this appointment');
        const review = await this.prisma.doctorReview.create({
            data: {
                doctorId: appt.doctorId,
                patientId: patient.id,
                appointmentId: dto.appointmentId,
                rating: dto.rating,
                comment: dto.comment,
            },
        });
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
let ReviewsController = class ReviewsController {
    constructor(svc) {
        this.svc = svc;
    }
    create(u, body) {
        return this.svc.create(u.id, body);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "create", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, swagger_1.ApiTags)('Reviews'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [ReviewsService])
], ReviewsController);
let ReviewsModule = class ReviewsModule {
};
exports.ReviewsModule = ReviewsModule;
exports.ReviewsModule = ReviewsModule = __decorate([
    (0, common_1.Module)({ controllers: [ReviewsController], providers: [ReviewsService] })
], ReviewsModule);
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyNotifications(userId, page = 1, limit = 20) {
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
    async markRead(userId, id) {
        if (id) {
            const n = await this.prisma.notification.findFirst({ where: { id, userId } });
            if (!n)
                throw new common_1.NotFoundException();
            return this.prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
        }
        return this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
    }
    async create(userId, type, title, body, data) {
        return this.prisma.notification.create({ data: { userId, type: type, title, body, data } });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
let NotificationsController = class NotificationsController {
    constructor(svc) {
        this.svc = svc;
    }
    getAll(u, p = 1) {
        return this.svc.getMyNotifications(u.id, +p);
    }
    readAll(u) {
        return this.svc.markRead(u.id);
    }
    readOne(id, u) {
        return this.svc.markRead(u.id, id);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    __param(0, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "readAll", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "readOne", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [NotificationsService])
], NotificationsController);
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({ controllers: [NotificationsController], providers: [NotificationsService], exports: [NotificationsService] })
], NotificationsModule);
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPaymentIntent(userId, appointmentId) {
        const patient = await this.prisma.patient.findUnique({ where: { userId } });
        const appt = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appt || appt.patientId !== patient?.id)
            throw new common_1.ForbiddenException();
        const payment = await this.prisma.payment.upsert({
            where: { appointmentId },
            create: { appointmentId, amount: appt.amount, currency: appt.currency, status: 'PENDING' },
            update: {},
        });
        return { paymentId: payment.id, amount: payment.amount, currency: payment.currency, clientSecret: 'pi_mock_secret' };
    }
    async confirmPayment(paymentId) {
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
    async getMyPayments(userId, role) {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
let PaymentsController = class PaymentsController {
    constructor(svc) {
        this.svc = svc;
    }
    createIntent(u, id) {
        return this.svc.createPaymentIntent(u.id, id);
    }
    confirm(id) {
        return this.svc.confirmPayment(id);
    }
    getMyPayments(u) {
        return this.svc.getMyPayments(u.id, u.role);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('intent'),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('appointmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createIntent", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getMyPayments", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [PaymentsService])
], PaymentsController);
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({ controllers: [PaymentsController], providers: [PaymentsService] })
], PaymentsModule);
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async getDoctorApplications(status) {
        return this.prisma.doctor.findMany({
            where: { applicationStatus: status?.toUpperCase() || 'PENDING' },
            include: { user: { select: { firstName: true, lastName: true, email: true, avatar: true, createdAt: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveDoctor(doctorId, note) {
        const doctor = await this.prisma.doctor.update({
            where: { id: doctorId },
            data: { applicationStatus: client_1.DoctorApplicationStatus.APPROVED, isVerified: true, applicationNote: note },
        });
        return doctor;
    }
    async rejectDoctor(doctorId, note) {
        return this.prisma.doctor.update({
            where: { id: doctorId },
            data: { applicationStatus: client_1.DoctorApplicationStatus.REJECTED, applicationNote: note },
        });
    }
    async getAllUsers(page = 1, limit = 20, search, role) {
        const where = {};
        if (search)
            where.OR = [{ firstName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
        if (role)
            where.role = role.toUpperCase();
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
    async toggleUserActive(userId, isActive) {
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
let AdminController = class AdminController {
    constructor(svc) {
        this.svc = svc;
    }
    getStats() { return this.svc.getStats(); }
    getApplications(status) { return this.svc.getDoctorApplications(status); }
    approve(id, note) { return this.svc.approveDoctor(id, note); }
    reject(id, note) { return this.svc.rejectDoctor(id, note); }
    getUsers(p = 1, l = 20, s, r) {
        return this.svc.getAllUsers(+p, +l, s, r);
    }
    toggle(id, isActive) { return this.svc.toggleUserActive(id, isActive); }
    getRevenue(days = 30) { return this.svc.getRevenueChart(+days); }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('applications'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Patch)('doctors/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)('doctors/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggle", null);
__decorate([
    (0, common_1.Get)('revenue'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getRevenue", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, guards_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [AdminService])
], AdminController);
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({ controllers: [AdminController], providers: [AdminService] })
], AdminModule);
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, phone: true, dateOfBirth: true, gender: true, isEmailVerified: true, createdAt: true },
        });
    }
    async updateProfile(userId, data) {
        const { firstName, lastName, phone, avatar, dateOfBirth, gender } = data;
        return this.prisma.user.update({
            where: { id: userId },
            data: { firstName, lastName, phone, avatar, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, gender },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, phone: true },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
let UsersController = class UsersController {
    constructor(svc) {
        this.svc = svc;
    }
    getProfile(u) { return this.svc.getProfile(u.id); }
    updateProfile(u, body) { return this.svc.updateProfile(u.id, body); }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [UsersService])
], UsersController);
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({ controllers: [UsersController], providers: [UsersService], exports: [UsersService] })
], UsersModule);
let PatientsService = class PatientsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyProfile(userId) {
        return this.prisma.patient.findUnique({
            where: { userId },
            include: { user: { select: { firstName: true, lastName: true, email: true, avatar: true, phone: true } } },
        });
    }
    async updateMyProfile(userId, data) {
        const patient = await this.prisma.patient.findUnique({ where: { userId } });
        if (!patient)
            throw new common_1.NotFoundException();
        return this.prisma.patient.update({ where: { id: patient.id }, data });
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatientsService);
let PatientsController = class PatientsController {
    constructor(svc) {
        this.svc = svc;
    }
    getMe(u) { return this.svc.getMyProfile(u.id); }
    updateMe(u, body) { return this.svc.updateMyProfile(u.id, body); }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "updateMe", null);
exports.PatientsController = PatientsController = __decorate([
    (0, swagger_1.ApiTags)('Patients'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('patients'),
    __metadata("design:paramtypes", [PatientsService])
], PatientsController);
let PatientsModule = class PatientsModule {
};
exports.PatientsModule = PatientsModule;
exports.PatientsModule = PatientsModule = __decorate([
    (0, common_1.Module)({ controllers: [PatientsController], providers: [PatientsService] })
], PatientsModule);
let MedicalRecordsService = class MedicalRecordsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyRecords(userId, type) {
        const patient = await this.prisma.patient.findUnique({ where: { userId } });
        if (!patient)
            throw new common_1.NotFoundException();
        return this.prisma.medicalRecord.findMany({
            where: { patientId: patient.id, ...(type && { type }) },
            orderBy: { date: 'desc' },
        });
    }
    async create(userId, data) {
        const patient = await this.prisma.patient.findUnique({ where: { userId } });
        if (!patient)
            throw new common_1.NotFoundException();
        return this.prisma.medicalRecord.create({ data: { ...data, patientId: patient.id, date: new Date(data.date) } });
    }
    async delete(id, userId) {
        const patient = await this.prisma.patient.findUnique({ where: { userId } });
        const record = await this.prisma.medicalRecord.findFirst({ where: { id, patientId: patient?.id } });
        if (!record)
            throw new common_1.NotFoundException();
        return this.prisma.medicalRecord.delete({ where: { id } });
    }
};
exports.MedicalRecordsService = MedicalRecordsService;
exports.MedicalRecordsService = MedicalRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MedicalRecordsService);
let MedicalRecordsController = class MedicalRecordsController {
    constructor(svc) {
        this.svc = svc;
    }
    getAll(u, type) { return this.svc.getMyRecords(u.id, type); }
    create(u, body) { return this.svc.create(u.id, body); }
    remove(id, u) { return this.svc.delete(id, u.id); }
};
exports.MedicalRecordsController = MedicalRecordsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MedicalRecordsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MedicalRecordsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MedicalRecordsController.prototype, "remove", null);
exports.MedicalRecordsController = MedicalRecordsController = __decorate([
    (0, swagger_1.ApiTags)('Medical Records'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('medical-records'),
    __metadata("design:paramtypes", [MedicalRecordsService])
], MedicalRecordsController);
let MedicalRecordsModule = class MedicalRecordsModule {
};
exports.MedicalRecordsModule = MedicalRecordsModule;
exports.MedicalRecordsModule = MedicalRecordsModule = __decorate([
    (0, common_1.Module)({ controllers: [MedicalRecordsController], providers: [MedicalRecordsService] })
], MedicalRecordsModule);
//# sourceMappingURL=combined.modules.js.map