import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async getMessages(userId: string, matchId: string, limit: number = 50, before?: string) {
    // Verify user is part of match
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        matchId,
        ...(before && { createdAt: { lt: new Date(before) } }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: { id: true, profile: { select: { firstName: true, displayName: true } } },
        },
      },
    });

    return messages.reverse();
  }

  async sendMessage(userId: string, matchId: string, content: string) {
    // Verify user is part of match
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userAId: userId }, { userBId: userId }],
        isActive: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const receiverId = match.userAId === userId ? match.userBId : match.userAId;

    // Analyze message for safety
    const safetyAnalysis = await this.aiService.analyzeText(content, 'safety');

    const message = await this.prisma.message.create({
      data: {
        matchId,
        senderId: userId,
        receiverId,
        content,
        safetyScore: safetyAnalysis.score,
        safetyFlags: safetyAnalysis.flags,
      },
      include: {
        sender: {
          select: { id: true, profile: { select: { firstName: true, displayName: true } } },
        },
      },
    });

    // Update match timestamp
    await this.prisma.match.update({
      where: { id: matchId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markAsRead(userId: string, matchId: string) {
    // Verify user is part of match
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    await this.prisma.message.updateMany({
      where: {
        matchId,
        receiverId: userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
        status: 'READ',
      },
    });

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        receiverId: userId,
        readAt: null,
      },
    });

    return { unreadCount: count };
  }
}
