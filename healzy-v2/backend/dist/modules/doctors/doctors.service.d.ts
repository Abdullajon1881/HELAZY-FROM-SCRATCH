import { PrismaService } from '@/database/prisma.service';
import { Prisma } from '@prisma/client';
interface DoctorFilterQuery {
    specialty?: string;
    minRating?: number;
    maxPrice?: number;
    minPrice?: number;
    language?: string;
    isAvailable?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
export declare class DoctorsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(query?: DoctorFilterQuery): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<any>;
    getMyProfile(userId: string): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            avatar: string;
        };
        schedules: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isAvailable: boolean;
            dayOfWeek: number;
            doctorId: string;
            startTime: string;
            endTime: string;
            slotDuration: number;
        }[];
        _count: {
            appointments: number;
            reviews: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        specialty: string;
        specialtyRu: string | null;
        specialtyUz: string | null;
        experience: number;
        bio: string | null;
        bioRu: string | null;
        bioUz: string | null;
        education: string | null;
        languages: string[];
        workingHours: string | null;
        isAvailable: boolean;
        isVerified: boolean;
        price: number;
        currency: string;
        documents: string[];
        applicationStatus: import(".prisma/client").$Enums.DoctorApplicationStatus;
        applicationNote: string | null;
        rating: number;
        reviewCount: number;
        consultationCount: number;
    }>;
    updateMyProfile(userId: string, data: Partial<any>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        specialty: string;
        specialtyRu: string | null;
        specialtyUz: string | null;
        experience: number;
        bio: string | null;
        bioRu: string | null;
        bioUz: string | null;
        education: string | null;
        languages: string[];
        workingHours: string | null;
        isAvailable: boolean;
        isVerified: boolean;
        price: number;
        currency: string;
        documents: string[];
        applicationStatus: import(".prisma/client").$Enums.DoctorApplicationStatus;
        applicationNote: string | null;
        rating: number;
        reviewCount: number;
        consultationCount: number;
    }>;
    setAvailability(userId: string, isAvailable: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        specialty: string;
        specialtyRu: string | null;
        specialtyUz: string | null;
        experience: number;
        bio: string | null;
        bioRu: string | null;
        bioUz: string | null;
        education: string | null;
        languages: string[];
        workingHours: string | null;
        isAvailable: boolean;
        isVerified: boolean;
        price: number;
        currency: string;
        documents: string[];
        applicationStatus: import(".prisma/client").$Enums.DoctorApplicationStatus;
        applicationNote: string | null;
        rating: number;
        reviewCount: number;
        consultationCount: number;
    }>;
    getSchedule(doctorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isAvailable: boolean;
        dayOfWeek: number;
        doctorId: string;
        startTime: string;
        endTime: string;
        slotDuration: number;
    }[]>;
    updateSchedule(userId: string, slots: any[]): Promise<Prisma.BatchPayload>;
    getAvailableSlots(doctorId: string, date: string): Promise<string[]>;
    getReviews(doctorId: string, page?: number, limit?: number): Promise<{
        data: ({
            appointment: {
                patient: {
                    user: {
                        firstName: string;
                        lastName: string;
                        avatar: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    bloodType: string | null;
                    allergies: string[];
                    chronicDiseases: string[];
                    emergencyContact: Prisma.JsonValue | null;
                    address: string | null;
                    city: string | null;
                    insurance: string | null;
                    userId: string;
                };
            } & {
                type: import(".prisma/client").$Enums.AppointmentType;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                doctorId: string;
                patientId: string;
                status: import(".prisma/client").$Enums.AppointmentStatus;
                scheduledAt: Date;
                duration: number;
                reason: string;
                symptoms: string[];
                notes: string | null;
                prescription: string | null;
                diagnosis: string | null;
                meetingUrl: string | null;
                chatRoomId: string | null;
                amount: number;
                isPaid: boolean;
                cancelReason: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            doctorId: string;
            patientId: string;
            appointmentId: string;
            comment: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    applyAsDoctor(userId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        specialty: string;
        specialtyRu: string | null;
        specialtyUz: string | null;
        experience: number;
        bio: string | null;
        bioRu: string | null;
        bioUz: string | null;
        education: string | null;
        languages: string[];
        workingHours: string | null;
        isAvailable: boolean;
        isVerified: boolean;
        price: number;
        currency: string;
        documents: string[];
        applicationStatus: import(".prisma/client").$Enums.DoctorApplicationStatus;
        applicationNote: string | null;
        rating: number;
        reviewCount: number;
        consultationCount: number;
    }>;
    private formatDoctor;
}
export {};
