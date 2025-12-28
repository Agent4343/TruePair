import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Delete in order respecting foreign key constraints
    await this.$transaction([
      this.scheduledDate.deleteMany(),
      this.block.deleteMany(),
      this.intentHistory.deleteMany(),
      this.verification.deleteMany(),
      this.safetySignal.deleteMany(),
      this.report.deleteMany(),
      this.riskAssessment.deleteMany(),
      this.trustScore.deleteMany(),
      this.behaviorLog.deleteMany(),
      this.message.deleteMany(),
      this.match.deleteMany(),
      this.like.deleteMany(),
      this.onboardingAnswer.deleteMany(),
      this.photo.deleteMany(),
      this.profilePrompt.deleteMany(),
      this.profile.deleteMany(),
      this.user.deleteMany(),
      this.onboardingQuestion.deleteMany(),
    ]);
  }
}
