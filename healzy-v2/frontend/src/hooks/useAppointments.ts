'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/services/appointmentService';
import type { AppointmentFilter, BookAppointmentDto } from '@/types/appointment';
import toast from 'react-hot-toast';

export function useAppointments(filters?: AppointmentFilter) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentService.getAll(filters),
  });
}

export function useAppointment(id: string | null) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getById(id!),
    enabled: !!id,
  });
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ['appointments-upcoming'],
    queryFn: appointmentService.getUpcoming,
    refetchInterval: 60000,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BookAppointmentDto) => appointmentService.book(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['appointments-upcoming'] });
      toast.success('Appointment booked successfully!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      toast.error(msg);
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => appointmentService.cancel(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment cancelled.');
    },
    onError: () => toast.error('Failed to cancel appointment.'),
  });
}

export function useCompleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes, prescription, diagnosis }: { id: string; notes?: string; prescription?: string; diagnosis?: string }) =>
      appointmentService.complete(id, notes, prescription, diagnosis),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment completed.');
    },
  });
}

export function useRateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating, review }: { id: string; rating: number; review?: string }) =>
      appointmentService.rate(id, rating, review),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Thank you for your review!');
    },
  });
}
