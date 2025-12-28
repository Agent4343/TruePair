import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async getQuestions(category?: string) {
    const where = category ? { category: category as any, isActive: true } : { isActive: true };

    return this.prisma.onboardingQuestion.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
  }

  async getProgress(userId: string) {
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

  async submitAnswer(userId: string, questionId: string, answer: any) {
    const question = await this.prisma.onboardingQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Check for existing answer
    const existingAnswer = await this.prisma.onboardingAnswer.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });

    // Score the answer quality
    const answerText = typeof answer === 'string' ? answer : JSON.stringify(answer);
    const quality = this.aiService.scoreAnswerQuality(answerText);

    // Check if follow-up is needed
    let followUp: string | null = null;
    const followUpCount = existingAnswer?.followUpCount || 0;

    if (followUpCount < 10 && quality.score < 60) {
      followUp = this.aiService.generateFollowUp(answerText, question.questionText);
    }

    // Create or update answer
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

  async completeOnboarding(userId: string) {
    const progress = await this.getProgress(userId);

    // Require at least 50% completion
    if (progress.progress < 50) {
      throw new BadRequestException('Please answer more questions before completing onboarding');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });

    return { message: 'Onboarding completed successfully' };
  }
}
