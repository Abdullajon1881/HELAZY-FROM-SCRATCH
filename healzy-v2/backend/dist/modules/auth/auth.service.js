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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const hashed = await bcrypt.hash(dto.password, 12);
        const verifyToken = (0, uuid_1.v4)();
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashed,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role,
                phone: dto.phone,
                emailVerifyToken: verifyToken,
            },
        });
        if (dto.role === client_1.UserRole.PATIENT) {
            await this.prisma.patient.create({ data: { userId: user.id } });
        }
        else if (dto.role === client_1.UserRole.DOCTOR) {
            await this.prisma.doctor.create({ data: { userId: user.id, specialty: 'General Practitioner' } });
        }
        this.logger.log(`User registered: ${user.email} (${user.role})`);
        return this.buildAuthResponse(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.password)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.isActive)
            throw new common_1.UnauthorizedException('Account is deactivated');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return this.buildAuthResponse(user);
    }
    async googleLogin(googleUser) {
        let user = await this.prisma.user.findFirst({
            where: { OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }] },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    googleId: googleUser.googleId,
                    email: googleUser.email,
                    firstName: googleUser.firstName,
                    lastName: googleUser.lastName,
                    avatar: googleUser.avatar,
                    role: client_1.UserRole.PATIENT,
                    isEmailVerified: true,
                },
            });
            await this.prisma.patient.create({ data: { userId: user.id } });
        }
        else if (!user.googleId) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { googleId: googleUser.googleId, isEmailVerified: true },
            });
        }
        return this.buildAuthResponse(user);
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user || !user.isActive)
                throw new common_1.UnauthorizedException();
            return this.buildAuthResponse(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            return { message: 'If that email exists, a reset link was sent.' };
        const token = (0, uuid_1.v4)();
        const expiry = new Date(Date.now() + 3600000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordResetToken: token, passwordResetExpiry: expiry },
        });
        this.logger.log(`Password reset requested for: ${user.email}`);
        return { message: 'Password reset link sent.' };
    }
    async resetPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetToken: dto.token,
                passwordResetExpiry: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired reset token');
        const hashed = await bcrypt.hash(dto.password, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
        });
        return { message: 'Password updated successfully.' };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.password)
            throw new common_1.NotFoundException('User not found');
        const valid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!valid)
            throw new common_1.BadRequestException('Current password is incorrect');
        const hashed = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
        return { message: 'Password changed successfully.' };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
        if (!user)
            throw new common_1.BadRequestException('Invalid verification token');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true, emailVerifyToken: null },
        });
        return { message: 'Email verified successfully.' };
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                role: true, avatar: true, phone: true, isEmailVerified: true,
                isActive: true, createdAt: true, updatedAt: true,
                doctor: { select: { id: true, specialty: true, isVerified: true, applicationStatus: true } },
                patient: { select: { id: true } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    buildAuthResponse(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwt.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
        });
        const refreshToken = this.jwt.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        });
        const { password, emailVerifyToken, passwordResetToken, passwordResetExpiry, ...safeUser } = user;
        return {
            user: safeUser,
            tokens: { accessToken, refreshToken },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map