import api from './api';
import type { Doctor, DoctorFilter, DoctorReview, DoctorSchedule } from '@/types/doctor';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const doctorService = {
  getAll: (filters?: DoctorFilter) =>
    api.get<PaginatedResponse<Doctor>>('/doctors', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Doctor>(`/doctors/${id}`).then((r) => r.data),

  getReviews: (id: string, page = 1, limit = 10) =>
    api.get<PaginatedResponse<DoctorReview>>(`/doctors/${id}/reviews`, { params: { page, limit } }).then((r) => r.data),

  getSchedule: (id: string) =>
    api.get<DoctorSchedule[]>(`/doctors/${id}/schedule`).then((r) => r.data),

  getAvailableSlots: (id: string, date: string) =>
    api.get<string[]>(`/doctors/${id}/slots`, { params: { date } }).then((r) => r.data),

  // Doctor profile management
  updateProfile: (data: Partial<Doctor>) =>
    api.patch<Doctor>('/doctors/me', data).then((r) => r.data),

  uploadDocuments: (files: FormData) =>
    api.post('/doctors/me/documents', files, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  updateSchedule: (schedule: Partial<DoctorSchedule>[]) =>
    api.put('/doctors/me/schedule', { schedule }).then((r) => r.data),

  setAvailability: (isAvailable: boolean) =>
    api.patch('/doctors/me/availability', { isAvailable }).then((r) => r.data),

  // Application
  applyAsDoctor: (data: FormData) =>
    api.post<Doctor>('/doctors/apply', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  getMyProfile: () =>
    api.get<Doctor>('/doctors/me').then((r) => r.data),

  // Reviews
  addReview: (doctorId: string, rating: number, comment: string) =>
    api.post<DoctorReview>(`/doctors/${doctorId}/reviews`, { rating, comment }).then((r) => r.data),
};
