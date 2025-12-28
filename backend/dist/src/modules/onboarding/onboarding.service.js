"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let OnboardingService = class OnboardingService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async getQuestions(category) {
        const where = category ? { category: category, isActive: true } : { isActive: true };
        return this.prisma.onboardingQuestion.findMany({
            where,
            orderBy: [{ category: 'asc' }, { order: 'asc' }],
        });
    }
    async getProgress(userId) {
        const [totalQuestions, answeredQuestions] = await Promise.all([
            this.prisma.onboardingQuestion.count({ where: { isActive: true } }),
            this.prisma.onboardingAnswer.count({ where: { userId } }),
        ]);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { onboardingCompleted: true },
        });
        return {
            totalQuestions,
            answeredQuestions,
            progress: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
            isComplete: user?.onboardingCompleted || false,
        };
    }
    async submitAnswer(userId, questionId, answer) {
        const question = await this.prisma.onboardingQuestion.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        const existingAnswer = await this.prisma.onboardingAnswer.findUnique({
            where: { userId_questionId: { userId, questionId } },
        });
        const answerText = typeof answer === 'string' ? answer : JSON.stringify(answer);
        const quality = this.aiService.scoreAnswerQuality(answerText);
        let followUp = null;
        const followUpCount = existingAnswer?.followUpCount || 0;
        if (followUpCount < 10 && quality.score < 60) {
            followUp = this.aiService.generateFollowUp(answerText, question.questionText);
        }
        const savedAnswer = await this.prisma.onboardingAnswer.upsert({
            where: { userId_questionId: { userId, questionId } },
            create: {
                userId,
                questionId,
                answer,
                followUpCount: followUp ? 1 : 0,
                confidence: quality.factors.authenticity / 100,
            },
            update: {
                answer,
                followUpCount: followUp ? followUpCount + 1 : followUpCount,
                confidence: quality.factors.authenticity / 100,
            },
        });
        return {
            answer: savedAnswer,
            quality,
            followUp,
            followUpCount: savedAnswer.followUpCount,
        };
    }
    async completeOnboarding(userId) {
        const progress = await this.getProgress(userId);
        if (progress.progress < 50) {
            throw new common_1.BadRequestException('Please answer more questions before completing onboarding');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { onboardingCompleted: true },
        });
        return { message: 'Onboarding completed successfully' };
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map