import { TrustService } from './trust.service';
export declare class TrustController {
    private trustService;
    constructor(trustService: TrustService);
    getTrustScore(req: any): Promise<{
        overall: number;
        breakdown: {
            replyPattern: number;
            commitment: number;
            respect: number;
            toneConsistency: number;
        };
        lastCalculated: Date;
    }>;
}
