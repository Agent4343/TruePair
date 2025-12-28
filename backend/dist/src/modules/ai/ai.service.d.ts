import { ConfigService } from '@nestjs/config';
export declare class AIService {
    private configService;
    private readonly hasLLM;
    constructor(configService: ConfigService);
    analyzeText(text: string, analysisType: 'safety' | 'intent' | 'consistency'): Promise<{
        score: number;
        flags: string[];
        insights: string[];
    }>;
    private analyzeSafetyRuleBased;
    private analyzeIntentRuleBased;
    private analyzeConsistencyRuleBased;
    generateFollowUp(answer: string, _questionContext: string): string | null;
    scoreAnswerQuality(answer: string): {
        score: number;
        factors: {
            specificity: number;
            depth: number;
            authenticity: number;
        };
    };
}
