import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
export declare class OnboardingService {
    private prisma;
    private aiService;
    constructor(prisma: PrismaService, aiService: AIService);
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
    getProgress(userId: string): Promise<{
        totalQuestions: number;
        answeredQuestions: number;
        progress: number;
        isComplete: boolean;
    }>;
    submitAnswer(userId: string, questionId: string, answer: any): Promise<{
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
    completeOnboarding(userId: string): Promise<{
        message: string;
    }>;
}
