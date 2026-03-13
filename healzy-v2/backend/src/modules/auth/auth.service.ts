import {
  Injectable, UnauthorizedException, ConflictException,
  NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── Register ───────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 12);
    const verifyToken = uuid();

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

    // Create role-specific profile
    if (dto.role === UserRole.PATIENT) {
      await this.prisma.patient.create({ data: { userId: user.id } });
    } else if (dto.role === UserRole.DOCTOR) {
      await this.prisma.doctor.create({ data: { userId: user.id, specialty: 'General Practitioner' } });
    }

    // TODO: send verification email
    this.logger.log(`User registered: ${user.email} (${user.role})`);

    return this.buildAuthResponse(user);
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.buildAuthResponse(user);
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  async googleLogin(googleUser: { googleId: string; email: string; firstName: string; lastName: string; avatar?: string }) {
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
          role: UserRole.PATIENT,
          isEmailVerified: true,
        },
      });
      await this.prisma.patient.create({ data: { userId: user.id } });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.googleId, isEmailVerified: true },
      });
    }

    return this.buildAuthResponse(user);
  }

  // ── Refresh token ─────────────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new UnauthorizedException();
      return this.buildAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return { message: 'If that email exists, a reset link was sent.' };

    const token = uuid();
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiry: expiry },
    });

    // TODO: send email with reset link
    this.logger.log(`Password reset requested for: ${user.email}`);
    return { message: 'Password reset link sent.' };
  }

  // ── Reset password ────────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpiry: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const hashed = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
    });

    return { message: 'Password updated successfully.' };
  }

  // ── Change password ───────────────────────────────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { message: 'Password changed successfully.' };
  }

  // ── Verify email ──────────────────────────────────────────────────────────
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) throw new BadRequestException('Invalid verification token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null },
    });
    return { message: 'Email verified successfully.' };
  }

  // ── Get current user ──────────────────────────────────────────────────────
  async me(userId: string) {
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
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ── Token builder ─────────────────────────────────────────────────────────
  private buildAuthResponse(user: any) {
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
}
