import { SafetyService } from './safety.service';
import { ReportUserDto, ScheduleDateDto, BlockUserDto } from './dto/safety.dto';
export declare class SafetyController {
    private safetyService;
    constructor(safetyService: SafetyService);
    reportUser(req: any, dto: ReportUserDto): Promise<{
        message: string;
        reportId: string;
    }>;
    getSafetySignals(userId: string): Promise<{
        type: import(".prisma/client").$Enums.SafetySignalType;
        verifiedAt: Date;
        label: string;
    }[]>;
    getPreDateCheck(req: any, matchId: string): Promise<{
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
    scheduleDate(req: any, dto: ScheduleDateDto): Promise<{
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
    blockUser(req: any, dto: BlockUserDto): Promise<{
        message: string;
    }>;
}
