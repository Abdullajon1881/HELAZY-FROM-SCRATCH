import { AppointmentsService } from './appointments.service';
export declare class AppointmentsController {
    private svc;
    constructor(svc: AppointmentsService);
    create(u: any, body: any): Promise<{
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
            emergencyContact: import("@prisma/client/runtime/library").JsonValue | null;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    findAll(u: any, query: any): Promise<{
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
                emergencyContact: import("@prisma/client/runtime/library").JsonValue | null;
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
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    upcoming(u: any): Promise<({
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
            emergencyContact: import("@prisma/client/runtime/library").JsonValue | null;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    stats(u: any): Promise<{
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
    findOne(id: string, u: any): Promise<{
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
            emergencyContact: import("@prisma/client/runtime/library").JsonValue | null;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    confirm(id: string, u: any): Promise<{
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
            emergencyContact: import("@prisma/client/runtime/library").JsonValue | null;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    cancel(id: string, u: any, reason: string): Promise<{
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
            emergencyContact: import("@prisma/client/runtime/library").JsonValue | null;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    complete(id: string, u: any, body: any): Promise<{
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
            emergencyContact: import("@prisma/client/runtime/library").JsonValue | null;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    reschedule(id: string, u: any, scheduledAt: string): Promise<{
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
}
export declare class AppointmentsModule {
}
