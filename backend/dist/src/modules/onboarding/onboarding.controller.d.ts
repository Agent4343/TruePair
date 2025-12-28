import { OnboardingService } from './onboarding.service';
import { SubmitAnswerDto } from './dto/onboarding.dto';
export declare class OnboardingController {
    private onboardingService;
    constructor(onboardingService: OnboardingService);
    getQuestions(category?: string): Promise<{
        id: string;
        category: import(".prisma/client").$Enums.QuestionCategory;
        questionText: string;
        questionType: import(".prisma/client").$Enums.QuestionType;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        followUpLogic: import("@prisma/client/runtime/library").JsonValue | null;
        order: number;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    getProgress(req: any): Promise<{
        totalQuestions: number;
        answeredQuestions: number;
        progress: number;
        isComplete: boolean;
    }>;
    submitAnswer(req: any, dto: SubmitAnswerDto): Promise<{
        answer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            answer: import("@prisma/client/runtime/library").JsonValue;
            confidence: number | null;
            consistency: number | null;
            questionId: string;
            followUpCount: number;
        };
        quality: {
            score: number;
            factors: {
                specificity: number;
                depth: number;
                authenticity: number;
            };
        };
        followUp: string | null;
        followUpCount: number;
    }>;
    complete(req: any): Promise<{
        message: string;
    }>;
}
