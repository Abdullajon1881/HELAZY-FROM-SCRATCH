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
var DoctorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let DoctorsService = DoctorsService_1 = class DoctorsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DoctorsService_1.name);
    }
    async findAll(query = {}) {
        const { specialty, minRating, maxPrice, minPrice, language, isAvailable, search, sortBy = 'rating', sortOrder = 'desc', page = 1, limit = 12, } = query;
        const where = {
            applicationStatus: client_1.DoctorApplicationStatus.APPROVED,
        };
        if (specialty)
            where.specialty = { contains: specialty, mode: 'insensitive' };
        if (isAvailable !== undefined)
            where.isAvailable = isAvailable;
        if (minRating)
            where.rating = { gte: minRating };
        if (maxPrice || minPrice) {
            where.price = {};
            if (maxPrice)
                where.price.lte = maxPrice;
            if (minPrice)
                where.price.gte = minPrice;
        }
        if (language)
            where.languages = { has: language };
        if (search) {
            where.OR = [
                { user: { firstName: { contains: search, mode: 'insensitive' } } },
                { user: { lastName: { contains: search, mode: 'insensitive' } } },
                { specialty: { contains: search, mode: 'insensitive' } },
            ];
        }
        const orderBy = sortBy === 'price' ? { price: sortOrder } :
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
    async findOne(id) {
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
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        return this.formatDoctor(doctor);
    }
    async getMyProfile(userId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId },
            include: {
                user: { select: { firstName: true, lastName: true, avatar: true, email: true, phone: true } },
                schedules: true,
                _count: { select: { appointments: true, reviews: true } },
            },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor profile not found');
        return doctor;
    }
    async updateMyProfile(userId, data) {
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
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
    async setAvailability(userId, isAvailable) {
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor)
            throw new common_1.NotFoundException();
        return this.prisma.doctor.update({ where: { id: doctor.id }, data: { isAvailable } });
    }
    async getSchedule(doctorId) {
        return this.prisma.doctorSchedule.findMany({
            where: { doctorId },
            orderBy: { dayOfWeek: 'asc' },
        });
    }
    async updateSchedule(userId, slots) {
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor)
            throw new common_1.NotFoundException();
        await this.prisma.doctorSchedule.deleteMany({ where: { doctorId: doctor.id } });
        return this.prisma.doctorSchedule.createMany({
            data: slots.map((s) => ({ ...s, doctorId: doctor.id })),
        });
    }
    async getAvailableSlots(doctorId, date) {
        const d = new Date(date);
        const dayOfWeek = d.getDay();
        const schedule = await this.prisma.doctorSchedule.findFirst({
            where: { doctorId, dayOfWeek, isAvailable: true },
        });
        if (!schedule)
            return [];
        const [startH, startM] = schedule.startTime.split(':').map(Number);
        const [endH, endM] = schedule.endTime.split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        const slots = [];
        for (let m = startMins; m < endMins; m += schedule.slotDuration) {
            const h = Math.floor(m / 60).toString().padStart(2, '0');
            const min = (m % 60).toString().padStart(2, '0');
            slots.push(`${h}:${min}`);
        }
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
    async getReviews(doctorId, page = 1, limit = 10) {
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
    async applyAsDoctor(userId, data) {
        const existing = await this.prisma.doctor.findUnique({ where: { userId } });
        if (existing) {
            return this.prisma.doctor.update({ where: { userId }, data: { ...data, applicationStatus: 'PENDING' } });
        }
        return this.prisma.doctor.create({ data: { ...data, userId } });
    }
    formatDoctor(doc) {
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
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = DoctorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map