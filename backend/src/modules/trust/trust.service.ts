import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BehaviorType } from '@prisma/client';

@Injectable()
export class TrustService {
  constructor(private prisma: PrismaService) {}

  async getTrustScore(userId: string) {
    let trustScore = await this.prisma.trustScore.findUnique({
      where: { userId },
    });

    if (!trustScore) {
      // Create default trust score
      trustScore = await this.prisma.trustScore.create({
        data: { userId },
      });
    }

    return {
      overall: trustScore.overallScore,
      breakdown: {
        replyPattern: trustScore.replyPatternScore,
        commitment: trustScore.commitmentScore,
        respect: trustScore.respectScore,
        toneConsistency: trustScore.toneConsistencyScore,
      },
      lastCalculated: trustScore.lastCalculatedAt,
    };
  }

  async logBehavior(userId: string, behaviorType: string, metadata?: any) {
    const score = this.getBehaviorScore(behaviorType);

    await this.prisma.behaviorLog.create({
      data: {
        userId,
        behaviorType: behaviorType as BehaviorType,
        metadata,
        score,
      },
    });

    // Recalculate trust score
    await this.recalculateTrustScore(userId);
  }

  async recalculateTrustScore(userId: string) {
    // Get recent behavior logs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const behaviors = await this.prisma.behaviorLog.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Calculate component scores
    let replyPatternScore = 50;
    let commitmentScore = 50;
    let respectScore = 50;
    const toneConsistencyScore = 50;

    // Analyze behaviors
    const messageBehaviors = behaviors.filter(
      (b) => b.behaviorType === 'MESSAGE_SENT' || b.behaviorType === 'MESSAGE_RECEIVED',
    );
    if (messageBehaviors.length > 0) {
      replyPatternScore = Math.min(100, 50 + messageBehaviors.length);
    }

    const commitmentBehaviors = behaviors.filter(
      (b) => b.behaviorType === 'DATE_COMPLETED' || b.behaviorType === 'DATE_CANCELLED',
    );
    const completed = commitmentBehaviors.filter((b) => b.behaviorType === 'DATE_COMPLETED').length;
    const cancelled = commitmentBehaviors.filter((b) => b.behaviorType === 'DATE_CANCELLED').length;
    if (completed + cancelled > 0) {
      commitmentScore = Math.round((completed / (completed + cancelled)) * 100);
    }

    const reportBehaviors = behaviors.filter((b) => b.behaviorType === 'REPORT_FILED');
    if (reportBehaviors.length > 0) {
      respectScore = Math.max(0, 100 - reportBehaviors.length * 20);
    } else {
      respectScore = 80;
    }

    // Calculate overall (weighted average)
    const overall = Math.round(
      replyPatternScore * 0.25 +
        commitmentScore * 0.3 +
        respectScore * 0.3 +
        toneConsistencyScore * 0.15,
    );

    // Update trust score
    await this.prisma.trustScore.upsert({
      where: { userId },
      create: {
        userId,
        overallScore: overall,
        replyPatternScore,
        commitmentScore,
        respectScore,
        toneConsistencyScore,
      },
      update: {
        overallScore: overall,
        replyPatternScore,
        commitmentScore,
        respectScore,
        toneConsistencyScore,
        lastCalculatedAt: new Date(),
      },
    });

    return { overall, replyPatternScore, commitmentScore, respectScore, toneConsistencyScore };
  }

  private getBehaviorScore(behaviorType: string): number {
    const scores: Record<string, number> = {
      MESSAGE_SENT: 1,
      MESSAGE_RECEIVED: 0,
      LIKE_SENT: 1,
      LIKE_RECEIVED: 0,
      MATCH_CREATED: 5,
      DATE_SCHEDULED: 3,
      DATE_COMPLETED: 10,
      DATE_CANCELLED: -5,
      REPORT_FILED: -10,
      BLOCK_CREATED: 0,
      PROFILE_UPDATED: 2,
    };
    return scores[behaviorType] || 0;
  }
}
