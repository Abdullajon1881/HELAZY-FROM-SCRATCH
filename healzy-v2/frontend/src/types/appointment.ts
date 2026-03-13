import type { Doctor } from './doctor';
import type { User } from './user';

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'video' | 'chat' | 'in_person';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patient?: User;
  doctor?: Doctor;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: string;
  duration: number; // minutes
  reason: string;
  notes?: string;
  symptoms?: string[];
  prescription?: string;
  diagnosis?: string;
  meetingUrl?: string;
  chatRoomId?: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookAppointmentDto {
  doctorId: string;
  type: AppointmentType;
  scheduledAt: string;
  duration: number;
  reason: string;
  symptoms?: string[];
}

export interface AppointmentFilter {
  status?: AppointmentStatus;
  type?: AppointmentType;
  from?: string;
  to?: string;
  doctorId?: string;
  patientId?: string;
  page?: number;
  limit?: number;
}

export const STATUS_LABELS: Record<AppointmentStatus, { en: string; ru: string; uz: string; color: string }> = {
  pending: { en: 'Pending', ru: 'Ожидает', uz: 'Kutilmoqda', color: 'yellow' },
  confirmed: { en: 'Confirmed', ru: 'Подтверждено', uz: 'Tasdiqlangan', color: 'blue' },
  in_progress: { en: 'In Progress', ru: 'В процессе', uz: 'Jarayonda', color: 'green' },
  completed: { en: 'Completed', ru: 'Завершено', uz: 'Tugallangan', color: 'teal' },
  cancelled: { en: 'Cancelled', ru: 'Отменено', uz: 'Bekor qilindi', color: 'red' },
  no_show: { en: 'No Show', ru: 'Не явился', uz: 'Kelmadi', color: 'gray' },
};
