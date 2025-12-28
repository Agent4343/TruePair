import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
export declare class SafetyService {
    private prisma;
    private aiService;
    constructor(prisma: PrismaService, aiService: AIService);
    reportUser(reporterId: string, reportedUserId: string, type: string, description?: string): Promise<{
        message: string;
        reportId: string;
    }>;
    getSafetySignals(userId: string): Promise<{
        type: import(".prisma/client").$Enums.SafetySignalType;
        verifiedAt: Date;
        label: string;
    }[]>;
    getPreDateSafetyCheck(userId: string, matchId: string): Promise<{
        safetyScore: number;
        partnerSignals: {
            type: import(".prisma/client").$Enums.SafetySignalType;
            verifiedAt: Date;
            label: string;
        }[];
        concerns: string[];
        suggestions: string[];
        recommendation: string;
    }>;
    scheduleDate(userId: string, matchId: string, dateTime: Date, location?: string, isPublicPlace?: boolean): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        safetyScore: number | null;
        matchId: string;
        dateTime: Date;
        location: string | null;
        isPublicPlace: boolean;
        safetyCheckIn: boolean;
        checkInTime: Date | null;
        locationSharing: boolean;
        concerns: string[];
        suggestions: string[];
        schedulerId: string;
        partnerId: string;
    }>;
    blockUser(blockerId: string, blockedUserId: string, reason?: string): Promise<{
        message: string;
    }>;
    private updateRiskAssessment;
    private getSignalLabel;
}
