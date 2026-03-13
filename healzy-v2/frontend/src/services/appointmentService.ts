import api from './api';
import type { Appointment, BookAppointmentDto, AppointmentFilter } from '@/types/appointment';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const appointmentService = {
  getAll: (filters?: AppointmentFilter) =>
    api.get<PaginatedResponse<Appointment>>('/appointments', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),

  book: (dto: BookAppointmentDto) =>
    api.post<Appointment>('/appointments', dto).then((r) => r.data),

  cancel: (id: string, reason?: string) =>
    api.patch<Appointment>(`/appointments/${id}/cancel`, { reason }).then((r) => r.data),

  confirm: (id: string) =>
    api.patch<Appointment>(`/appointments/${id}/confirm`).then((r) => r.data),

  complete: (id: string, notes?: string, prescription?: string, diagnosis?: string) =>
    api.patch<Appointment>(`/appointments/${id}/complete`, { notes, prescription, diagnosis }).then((r) => r.data),

  reschedule: (id: string, scheduledAt: string) =>
    api.patch<Appointment>(`/appointments/${id}/reschedule`, { scheduledAt }).then((r) => r.data),

  rate: (id: string, rating: number, review?: string) =>
    api.post(`/appointments/${id}/review`, { rating, review }).then((r) => r.data),

  getUpcoming: () =>
    api.get<Appointment[]>('/appointments/upcoming').then((r) => r.data),

  getStats: () =>
    api.get('/appointments/stats').then((r) => r.data),
};
