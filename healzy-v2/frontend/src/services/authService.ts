import api from './api';
import type { LoginDto, RegisterDto, AuthResponse, User } from '@/types/user';

export const authService = {
  login: (dto: LoginDto) =>
    api.post<AuthResponse>('/auth/login', dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    api.post<AuthResponse>('/auth/register', dto).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),

  me: () =>
    api.get<User>('/auth/me').then((r) => r.data),

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then((r) => r.data),

  googleLogin: (idToken: string) =>
    api.post<AuthResponse>('/auth/google', { idToken }).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
};
