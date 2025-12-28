import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
export declare class MessagesService {
    private prisma;
    private aiService;
    constructor(prisma: PrismaService, aiService: AIService);
    getMessages(userId: string, matchId: string, limit?: number, before?: string): Promise<({
        sender: {
            id: string;
            profile: {
                firstName: string;
                displayName: string | null;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.MessageStatus;
        content: string;
        safetyScore: number | null;
        safetyFlags: string[];
        readAt: Date | null;
        matchId: string;
        senderId: string;
        receiverId: string;
    })[]>;
    sendMessage(userId: string, matchId: string, content: string): Promise<{
        sender: {
            id: string;
            profile: {
                firstName: string;
                displayName: string | null;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.MessageStatus;
        content: string;
        safetyScore: number | null;
        safetyFlags: string[];
        readAt: Date | null;
        matchId: string;
        senderId: string;
        receiverId: string;
    }>;
    markAsRead(userId: string, matchId: string): Promise<{
        success: boolean;
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
}
