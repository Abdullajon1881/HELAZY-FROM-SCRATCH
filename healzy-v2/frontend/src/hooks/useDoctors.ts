'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import type { DoctorFilter } from '@/types/doctor';
import toast from 'react-hot-toast';

export function useDoctors(filters?: DoctorFilter) {
  return useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => doctorService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDoctor(id: string | null) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDoctorReviews(id: string | null, page = 1) {
  return useQuery({
    queryKey: ['doctor-reviews', id, page],
    queryFn: () => doctorService.getReviews(id!, page),
    enabled: !!id,
  });
}

export function useDoctorSchedule(id: string | null) {
  return useQuery({
    queryKey: ['doctor-schedule', id],
    queryFn: () => doctorService.getSchedule(id!),
    enabled: !!id,
  });
}

export function useAvailableSlots(doctorId: string | null, date: string | null) {
  return useQuery({
    queryKey: ['available-slots', doctorId, date],
    queryFn: () => doctorService.getAvailableSlots(doctorId!, date!),
    enabled: !!doctorId && !!date,
  });
}

export function useMyDoctorProfile() {
  return useQuery({
    queryKey: ['my-doctor-profile'],
    queryFn: doctorService.getMyProfile,
  });
}

export function useAddReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, rating, comment }: { doctorId: string; rating: number; comment: string }) =>
      doctorService.addReview(doctorId, rating, comment),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['doctor-reviews', vars.doctorId] });
      qc.invalidateQueries({ queryKey: ['doctor', vars.doctorId] });
      toast.success('Review submitted!');
    },
    onError: () => toast.error('Failed to submit review.'),
  });
}
