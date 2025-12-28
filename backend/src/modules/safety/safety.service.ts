import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { ReportType, RiskLevel } from '@prisma/client';

@Injectable()
export class SafetyService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async reportUser(reporterId: string, reportedUserId: string, type: string, description?: string) {
    if (reporterId === reportedUserId) {
      throw new BadRequestException('Cannot report yourself');
    }

    const reportedUser = await this.prisma.user.findUnique({
      where: { id: reportedUserId },
    });

    if (!reportedUser) {
      throw new NotFoundException('User not found');
    }

    const report = await this.prisma.report.create({
      data: {
        reporterId,
        reportedUserId,
        type: type as ReportType,
        description,
      },
    });

    // Update risk assessment
    await this.updateRiskAssessment(reportedUserId);

    return { message: 'Report submitted successfully', reportId: report.id };
  }

  async getSafetySignals(userId: string) {
    const signals = await this.prisma.safetySignal.findMany({
      where: { userId },
    });

    return signals.map((signal) => ({
      type: signal.signalType,
      verifiedAt: signal.verifiedAt,
      label: this.getSignalLabel(signal.signalType),
    }));
  }

  async getPreDateSafetyCheck(userId: string, matchId: string) {
    // Verify user is part of match
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const otherUserId = match.userAId === userId ? match.userBId : match.userAId;

    // Analyze recent messages
    const messageContent = match.messages.map((m) => m.content).join('\n');
    const analysis = await this.aiService.analyzeText(messageContent, 'safety');

    // Get other user's safety signals
    const otherUserSignals = await this.getSafetySignals(otherUserId);

    // Generate suggestions
    const suggestions: string[] = [
      'Meet in a public place for your first date',
      "Tell a friend where you're going and when",
      'Enable location sharing with a trusted contact',
      'Arrange your own transportation',
    ];

    const concerns: string[] = [];
    if (analysis.score < 70) {
      concerns.push('Some concerning language patterns detected in messages');
    }
    if (analysis.flags.includes('pressure_language')) {
      concerns.push('Pressure tactics detected in conversation');
    }

    return {
      safetyScore: analysis.score,
      partnerSignals: otherUserSignals,
      concerns,
      suggestions,
      recommendation:
        analysis.score >= 80 ? 'LOW_RISK' : analysis.score >= 60 ? 'MODERATE' : 'CAUTION',
    };
  }

  async scheduleDate(
    userId: string,
    matchId: string,
    dateTime: Date,
    location?: string,
    isPublicPlace?: boolean,
  ) {
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const partnerId = match.userAId === userId ? match.userBId : match.userAId;

    const scheduledDate = await this.prisma.scheduledDate.create({
      data: {
        matchId,
        schedulerId: userId,
        partnerId,
        dateTime,
        location,
        isPublicPlace: isPublicPlace ?? true,
      },
    });

    return scheduledDate;
  }

  async blockUser(blockerId: string, blockedUserId: string, reason?: string) {
    if (blockerId === blockedUserId) {
      throw new BadRequestException('Cannot block yourself');
    }

    const blockedUser = await this.prisma.user.findUnique({
      where: { id: blockedUserId },
    });

    if (!blockedUser) {
      throw new NotFoundException('User not found');
    }

    // Create block
    await this.prisma.block.upsert({
      where: { blockerId_blockedUserId: { blockerId, blockedUserId } },
      create: { blockerId, blockedUserId, reason },
      update: { reason },
    });

    // Deactivate any existing match
    await this.prisma.match.updateMany({
      where: {
        OR: [
          { userAId: blockerId, userBId: blockedUserId },
          { userAId: blockedUserId, userBId: blockerId },
        ],
      },
      data: { isActive: false },
    });

    return { message: 'User blocked successfully' };
  }

  private async updateRiskAssessment(userId: string) {
    // Count reports
    const reports = await this.prisma.report.count({
      where: { reportedUserId: userId },
    });

    // Calculate report score (0-100)
    const reportScore = Math.min(100, reports * 20);

    // Get message risk (average of flagged messages)
    const flaggedMessages = await this.prisma.message.findMany({
      where: { senderId: userId, safetyScore: { lt: 70 } },
      select: { safetyScore: true },
    });

    const messageRiskScore =
      flaggedMessages.length > 0
        ? Math.round(
            100 -
              flaggedMessages.reduce((sum, m) => sum + (m.safetyScore || 100), 0) /
                flaggedMessages.length,
          )
        : 0;

    // Calculate overall risk
    const riskIndex = Math.round(reportScore * 0.4 + messageRiskScore * 0.35 + 0 * 0.25);

    let riskLevel: RiskLevel = 'NORMAL';
    if (riskIndex >= 80) riskLevel = 'MANUAL_REVIEW';
    else if (riskIndex >= 60) riskLevel = 'RESTRICTED';
    else if (riskIndex >= 30) riskLevel = 'MONITOR';

    await this.prisma.riskAssessment.upsert({
      where: { userId },
      create: {
        userId,
        riskIndex,
        riskLevel,
        reportScore,
        messageRiskScore,
      },
      update: {
        riskIndex,
        riskLevel,
        reportScore,
        messageRiskScore,
        lastAssessedAt: new Date(),
      },
    });
  }

  private getSignalLabel(signalType: string): string {
    const labels: Record<string, string> = {
      VERIFIED_PHOTO: 'Verified Photos',
      VERIFIED_EMAIL: 'Verified Email',
      VERIFIED_PHONE: 'Verified Phone',
      CONSISTENT_PROFILE: 'Consistent Profile',
      RESPONSIVE_COMMUNICATOR: 'Responsive Communicator',
      BOUNDARIES_RESPECTED: 'Respects Boundaries',
      LONG_TERM_USER: 'Long-term Member',
    };
    return labels[signalType] || signalType;
  }
}
