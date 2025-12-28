import { PrismaService } from '../../prisma/prisma.service';
export declare class TrustService {
    private prisma;
    constructor(prisma: PrismaService);
    getTrustScore(userId: string): Promise<{
        overall: number;
        breakdown: {
            replyPattern: number;
            commitment: number;
            respect: number;
            toneConsistency: number;
        };
        lastCalculated: Date;
    }>;
    logBehavior(userId: string, behaviorType: string, metadata?: any): Promise<void>;
    recalculateTrustScore(userId: string): Promise<{
        overall: number;
        replyPatternScore: number;
        commitmentScore: number;
        respectScore: number;
        toneConsistencyScore: number;
    }>;
    private getBehaviorScore;
}
