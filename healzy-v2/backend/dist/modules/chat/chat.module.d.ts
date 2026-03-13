import { ChatService } from './chat.service';
export declare class ChatController {
    private chat;
    constructor(chat: ChatService);
    getConversations(u: any): Promise<({
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
            userId: string;
            bloodType: string | null;
            allergies: string[];
            chronicDiseases: string[];
            emergencyContact: import("@prisma/client/runtime/library").JsonValue | null;
            address: string | null;
            city: string | null;
            insurance: string | null;
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
        messages: {
            id: string;
            sentAt: Date;
            conversationId: string;
            senderId: string;
            text: string;
            fileUrl: string | null;
            fileName: string | null;
            fileType: string | null;
            isRead: boolean;
            readAt: Date | null;
        }[];
        _count: {
            messages: number;
        };
    } & {
        id: string;
        patientId: string;
        doctorId: string;
        appointmentId: string | null;
        status: import(".prisma/client").$Enums.ConversationStatus;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createConversation(u: any, body: {
        doctorId: string;
        appointmentId?: string;
    }): Promise<{
        id: string;
        patientId: string;
        doctorId: string;
        appointmentId: string | null;
        status: import(".prisma/client").$Enums.ConversationStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMessages(id: string, u: any, page?: number): Promise<{
        messages: ({
            sender: {
                id: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.UserRole;
                avatar: string;
            };
        } & {
            id: string;
            sentAt: Date;
            conversationId: string;
            senderId: string;
            text: string;
            fileUrl: string | null;
            fileName: string | null;
            fileType: string | null;
            isRead: boolean;
            readAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    endConversation(id: string, u: any): Promise<{
        id: string;
        patientId: string;
        doctorId: string;
        appointmentId: string | null;
        status: import(".prisma/client").$Enums.ConversationStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare class ChatModule {
}
