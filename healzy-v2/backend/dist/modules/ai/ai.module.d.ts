import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
export declare class AIService {
    private prisma;
    private config;
    private readonly logger;
    private anthropic;
    private gemini;
    constructor(prisma: PrismaService, config: ConfigService);
    chat(userId: string, messages: any[], sessionId?: string): Promise<{
        message: any;
        sessionId: string;
        suggestions: string[];
    }>;
    analyzeImage(userId: string, imageBase64: string, question?: string): Promise<{
        message: string;
        sessionId: any;
        suggestions: string[];
    }>;
    checkSymptoms(userId: string, symptoms: string[], age?: number, gender?: string): Promise<{
        message: any;
        sessionId: string;
        suggestions: string[];
    }>;
    textToSpeech(text: string, lang?: string): Promise<Buffer<ArrayBuffer>>;
    getSessions(userId: string): Promise<({
        messages: {
            role: string;
            id: string;
            createdAt: Date;
            content: string;
            sessionId: string;
            imageUrl: string | null;
        }[];
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    })[]>;
    getSession(sessionId: string, userId: string): Promise<{
        messages: {
            role: string;
            id: string;
            createdAt: Date;
            content: string;
            sessionId: string;
            imageUrl: string | null;
        }[];
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    deleteSession(sessionId: string, userId: string): Promise<{
        success: boolean;
    }>;
    private extractSuggestions;
}
export declare class AIController {
    private ai;
    constructor(ai: AIService);
    chat(u: any, body: {
        messages: any[];
        sessionId?: string;
    }): Promise<{
        message: any;
        sessionId: string;
        suggestions: string[];
    }>;
    analyzeImage(u: any, body: {
        imageBase64: string;
        question?: string;
    }): Promise<{
        message: string;
        sessionId: any;
        suggestions: string[];
    }>;
    checkSymptoms(u: any, body: {
        symptoms: string[];
        age?: number;
        gender?: string;
    }): Promise<{
        message: any;
        sessionId: string;
        suggestions: string[];
    }>;
    tts(u: any, body: {
        text: string;
        lang?: string;
    }, res: any): Promise<any>;
    getSessions(u: any): Promise<({
        messages: {
            role: string;
            id: string;
            createdAt: Date;
            content: string;
            sessionId: string;
            imageUrl: string | null;
        }[];
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    })[]>;
    getSession(id: string, u: any): Promise<{
        messages: {
            role: string;
            id: string;
            createdAt: Date;
            content: string;
            sessionId: string;
            imageUrl: string | null;
        }[];
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    deleteSession(id: string, u: any): Promise<{
        success: boolean;
    }>;
}
export declare class AIModule {
}
