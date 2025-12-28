import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Connecting to database...');
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
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
