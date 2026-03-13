import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/database/prisma.service';
import { UserRole, Prisma } from '@prisma/client';
export declare class AppointmentsService {
    private prisma;
    private events;
    private readonly logger;
    constructor(prisma: PrismaService, events: EventEmitter2);
    create(userId: string, dto: any): Promise<{
        patient: {
            user: {
                email: string;
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
        doctor: {
            user: {
                firstName: string;
                lastName: string;
                avatar: string;
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
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            appointmentId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripePaymentIntentId: string | null;
            stripeSessionId: string | null;
            refundedAt: Date | null;
            refundAmount: number | null;
            metadata: Prisma.JsonValue | null;
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
    }>;
    findAll(userId: string, role: UserRole, query?: any): Promise<{
        data: ({
            patient: {
                user: {
                    email: string;
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
            doctor: {
                user: {
                    firstName: string;
                    lastName: string;
                    avatar: string;
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
            };
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                appointmentId: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                amount: number;
                stripePaymentIntentId: string | null;
                stripeSessionId: string | null;
                refundedAt: Date | null;
                refundAmount: number | null;
                metadata: Prisma.JsonValue | null;
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, userId: string, role: UserRole): Promise<{
        patient: {
            user: {
                email: string;
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
        doctor: {
            user: {
                firstName: string;
                lastName: string;
                avatar: string;
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
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            appointmentId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripePaymentIntentId: string | null;
            stripeSessionId: string | null;
            refundedAt: Date | null;
            refundAmount: number | null;
            metadata: Prisma.JsonValue | null;
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
    }>;
    confirm(id: string, userId: string): Promise<{
        patient: {
            user: {
                email: string;
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
        doctor: {
            user: {
                firstName: string;
                lastName: string;
                avatar: string;
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
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            appointmentId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripePaymentIntentId: string | null;
            stripeSessionId: string | null;
            refundedAt: Date | null;
            refundAmount: number | null;
            metadata: Prisma.JsonValue | null;
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
    }>;
    cancel(id: string, userId: string, role: UserRole, reason?: string): Promise<{
        patient: {
            user: {
                email: string;
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
        doctor: {
            user: {
                firstName: string;
                lastName: string;
                avatar: string;
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
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            appointmentId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripePaymentIntentId: string | null;
            stripeSessionId: string | null;
            refundedAt: Date | null;
            refundAmount: number | null;
            metadata: Prisma.JsonValue | null;
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
    }>;
    complete(id: string, userId: string, body: any): Promise<{
        patient: {
            user: {
                email: string;
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
        doctor: {
            user: {
                firstName: string;
                lastName: string;
                avatar: string;
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
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            appointmentId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripePaymentIntentId: string | null;
            stripeSessionId: string | null;
            refundedAt: Date | null;
            refundAmount: number | null;
            metadata: Prisma.JsonValue | null;
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
    }>;
    reschedule(id: string, userId: string, role: UserRole, scheduledAt: string): Promise<{
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
    }>;
    getUpcoming(userId: string, role: UserRole): Promise<({
        patient: {
            user: {
                email: string;
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
        doctor: {
            user: {
                firstName: string;
                lastName: string;
                avatar: string;
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
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            appointmentId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripePaymentIntentId: string | null;
            stripeSessionId: string | null;
            refundedAt: Date | null;
            refundAmount: number | null;
            metadata: Prisma.JsonValue | null;
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
    })[]>;
    getStats(userId: string, role: UserRole): Promise<{
        total?: undefined;
        upcoming?: undefined;
        completed?: undefined;
        today?: undefined;
        rating?: undefined;
        consultationCount?: undefined;
    } | {
        total: number;
        upcoming: number;
        completed: number;
        today?: undefined;
        rating?: undefined;
        consultationCount?: undefined;
    } | {
        total: number;
        today: number;
        rating: number;
        consultationCount: number;
        upcoming?: undefined;
        completed?: undefined;
    }>;
    private findOrThrow;
    private checkAccess;
    private appointmentIncludes;
}
