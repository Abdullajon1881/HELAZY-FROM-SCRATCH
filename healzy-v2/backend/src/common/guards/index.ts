import {
  Injectable, CanActivate, ExecutionContext,
  SetMetadata, createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';

// ── Roles decorator ────────────────────────────────────────────────────────────
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// ── Roles guard ────────────────────────────────────────────────────────────────
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return required.includes(user?.role);
  }
}

// ── JWT Auth guard (shortcut) ──────────────────────────────────────────────────
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// ── Optional JWT guard ─────────────────────────────────────────────────────────
@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    return user || null;
  }
}

// ── Current user decorator ─────────────────────────────────────────────────────
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
