import { PrismaService } from '@/database/prisma.service';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: {
        appointmentId: string;
        rating: number;
        comment?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        doctorId: string;
        patientId: string;
        appointmentId: string;
        comment: string | null;
    }>;
}
export declare class ReviewsController {
    private svc;
    constructor(svc: ReviewsService);
    create(u: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        doctorId: string;
        patientId: string;
        appointmentId: string;
        comment: string | null;
    }>;
}
export declare class ReviewsModule {
}
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: {
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            id: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
            isRead: boolean;
            readAt: Date | null;
            body: string;
        }[];
        total: number;
        unread: number;
        page: number;
        limit: number;
    }>;
    markRead(userId: string, id?: string): Promise<import(".prisma/client").Prisma.BatchPayload | {
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
        body: string;
    }>;
    create(userId: string, type: string, title: string, body: string, data?: any): Promise<{
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
        body: string;
    }>;
}
export declare class NotificationsController {
    private svc;
    constructor(svc: NotificationsService);
    getAll(u: any, p?: number): Promise<{
        data: {
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            id: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
            isRead: boolean;
            readAt: Date | null;
            body: string;
        }[];
        total: number;
        unread: number;
        page: number;
        limit: number;
    }>;
    readAll(u: any): Promise<import(".prisma/client").Prisma.BatchPayload | {
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
        body: string;
    }>;
    readOne(id: string, u: any): Promise<import(".prisma/client").Prisma.BatchPayload | {
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
        body: string;
    }>;
}
export declare class NotificationsModule {
}
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    createPaymentIntent(userId: string, appointmentId: string): Promise<{
        paymentId: string;
        amount: number;
        currency: string;
        clientSecret: string;
    }>;
    confirmPayment(paymentId: string): Promise<{
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
    }>;
    getMyPayments(userId: string, role: string): Promise<({
        appointment: {
            doctor: {
                user: {
                    firstName: string;
                    lastName: string;
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
        currency: string;
        appointmentId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        amount: number;
        stripePaymentIntentId: string | null;
        stripeSessionId: string | null;
        refundedAt: Date | null;
        refundAmount: number | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
export declare class PaymentsController {
    private svc;
    constructor(svc: PaymentsService);
    createIntent(u: any, id: string): Promise<{
        paymentId: string;
        amount: number;
        currency: string;
        clientSecret: string;
    }>;
    confirm(id: string): Promise<{
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
    }>;
    getMyPayments(u: any): Promise<({
        appointment: {
            doctor: {
                user: {
                    firstName: string;
                    lastName: string;
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
        currency: string;
        appointmentId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        amount: number;
        stripePaymentIntentId: string | null;
        stripeSessionId: string | null;
        refundedAt: Date | null;
        refundAmount: number | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
export declare class PaymentsModule {
}
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        users: number;
        doctors: number;
        patients: number;
        appointments: number;
        revenue: number;
    }>;
    getDoctorApplications(status?: string): Promise<({
        user: {
            email: string;
            firstName: string;
            lastName: string;
            avatar: string;
            createdAt: Date;
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
    })[]>;
    approveDoctor(doctorId: string, note?: string): Promise<{
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
    rejectDoctor(doctorId: string, note: string): Promise<{
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
    getAllUsers(page?: number, limit?: number, search?: string, role?: string): Promise<{
        data: {
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            avatar: string;
            isActive: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    toggleUserActive(userId: string, isActive: boolean): Promise<{
        email: string;
        password: string | null;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string | null;
        id: string;
        googleId: string | null;
        avatar: string | null;
        dateOfBirth: Date | null;
        gender: string | null;
        isEmailVerified: boolean;
        isActive: boolean;
        emailVerifyToken: string | null;
        passwordResetToken: string | null;
        passwordResetExpiry: Date | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getRevenueChart(days?: number): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PaymentGroupByOutputType, "createdAt"[]> & {
        _sum: {
            amount: number;
        };
    })[]>;
}
export declare class AdminController {
    private svc;
    constructor(svc: AdminService);
    getStats(): Promise<{
        users: number;
        doctors: number;
        patients: number;
        appointments: number;
        revenue: number;
    }>;
    getApplications(status?: string): Promise<({
        user: {
            email: string;
            firstName: string;
            lastName: string;
            avatar: string;
            createdAt: Date;
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
    })[]>;
    approve(id: string, note?: string): Promise<{
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
    reject(id: string, note: string): Promise<{
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
    getUsers(p?: number, l?: number, s?: string, r?: string): Promise<{
        data: {
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            avatar: string;
            isActive: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    toggle(id: string, isActive: boolean): Promise<{
        email: string;
        password: string | null;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string | null;
        id: string;
        googleId: string | null;
        avatar: string | null;
        dateOfBirth: Date | null;
        gender: string | null;
        isEmailVerified: boolean;
        isActive: boolean;
        emailVerifyToken: string | null;
        passwordResetToken: string | null;
        passwordResetExpiry: Date | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getRevenue(days?: number): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PaymentGroupByOutputType, "createdAt"[]> & {
        _sum: {
            amount: number;
        };
    })[]>;
}
export declare class AdminModule {
}
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string;
        id: string;
        avatar: string;
        dateOfBirth: Date;
        gender: string;
        isEmailVerified: boolean;
        createdAt: Date;
    }>;
    updateProfile(userId: string, data: any): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string;
        id: string;
        avatar: string;
    }>;
}
export declare class UsersController {
    private svc;
    constructor(svc: UsersService);
    getProfile(u: any): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string;
        id: string;
        avatar: string;
        dateOfBirth: Date;
        gender: string;
        isEmailVerified: boolean;
        createdAt: Date;
    }>;
    updateProfile(u: any, body: any): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string;
        id: string;
        avatar: string;
    }>;
}
export declare class UsersModule {
}
export declare class PatientsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyProfile(userId: string): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
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
    }>;
    updateMyProfile(userId: string, data: any): Promise<{
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
    }>;
}
export declare class PatientsController {
    private svc;
    constructor(svc: PatientsService);
    getMe(u: any): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
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
    }>;
    updateMe(u: any, body: any): Promise<{
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
    }>;
}
export declare class PatientsModule {
}
export declare class MedicalRecordsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyRecords(userId: string, type?: string): Promise<{
        type: string;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        patientId: string;
        date: Date;
        fileUrl: string | null;
        fileName: string | null;
        fileSize: number | null;
        doctorName: string | null;
        facility: string | null;
        isPrivate: boolean;
    }[]>;
    create(userId: string, data: any): Promise<{
        type: string;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        patientId: string;
        date: Date;
        fileUrl: string | null;
        fileName: string | null;
        fileSize: number | null;
        doctorName: string | null;
        facility: string | null;
        isPrivate: boolean;
    }>;
    delete(id: string, userId: string): Promise<{
        type: string;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        patientId: string;
        date: Date;
        fileUrl: string | null;
        fileName: string | null;
        fileSize: number | null;
        doctorName: string | null;
        facility: string | null;
        isPrivate: boolean;
    }>;
}
export declare class MedicalRecordsController {
    private svc;
    constructor(svc: MedicalRecordsService);
    getAll(u: any, type?: string): Promise<{
        type: string;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        patientId: string;
        date: Date;
        fileUrl: string | null;
        fileName: string | null;
        fileSize: number | null;
        doctorName: string | null;
        facility: string | null;
        isPrivate: boolean;
    }[]>;
    create(u: any, body: any): Promise<{
        type: string;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        patientId: string;
        date: Date;
        fileUrl: string | null;
        fileName: string | null;
        fileSize: number | null;
        doctorName: string | null;
        facility: string | null;
        isPrivate: boolean;
    }>;
    remove(id: string, u: any): Promise<{
        type: string;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        patientId: string;
        date: Date;
        fileUrl: string | null;
        fileName: string | null;
        fileSize: number | null;
        doctorName: string | null;
        facility: string | null;
        isPrivate: boolean;
    }>;
}
export declare class MedicalRecordsModule {
}
