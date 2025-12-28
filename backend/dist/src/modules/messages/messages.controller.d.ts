import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/messages.dto';
export declare class MessagesController {
    private messagesService;
    constructor(messagesService: MessagesService);
    getMessages(req: any, matchId: string, limit?: number, before?: string): Promise<({
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
    sendMessage(req: any, matchId: string, dto: SendMessageDto): Promise<{
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
    markAsRead(req: any, matchId: string): Promise<{
        success: boolean;
    }>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
}
