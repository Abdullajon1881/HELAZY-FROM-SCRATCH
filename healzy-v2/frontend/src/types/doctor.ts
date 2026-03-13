export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  specialtyRu: string;
  specialtyUz: string;
  experience: number;
  rating: number;
  reviewCount: number;
  consultationCount: number;
  bio: string;
  bioRu: string;
  bioUz: string;
  education: string;
  languages: string[];
  workingHours: string;
  isAvailable: boolean;
  isVerified: boolean;
  avatar: string | null;
  price: number;
  currency: string;
  documents: string[];
  applicationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface DoctorFilter {
  specialty?: string;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  language?: string;
  isAvailable?: boolean;
  search?: string;
  sortBy?: 'rating' | 'price' | 'experience' | 'consultations';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isAvailable: boolean;
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  patientId: string;
  patient: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export const SPECIALTIES = [
  'Cardiologist', 'Neurologist', 'Pediatrician', 'Dermatologist',
  'Orthopedist', 'Psychiatrist', 'Gynecologist', 'Urologist',
  'Ophthalmologist', 'ENT', 'Endocrinologist', 'Gastroenterologist',
  'Pulmonologist', 'Oncologist', 'General Practitioner', 'Dentist',
  'Allergist', 'Rheumatologist', 'Nephrologist', 'Surgeon',
] as const;

export type Specialty = typeof SPECIALTIES[number];
