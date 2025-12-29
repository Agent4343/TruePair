import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  async getDiscoveryProfiles(userId: string, limit: number = 10) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      throw new BadRequestException('Please complete your profile first');
    }

    // Get users the current user has already liked or passed
    const interacted = await this.prisma.like.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true },
    });
    const interactedIds = interacted.map((l) => l.toUserId);

    // Get blocked users
    const blocks = await this.prisma.block.findMany({
      where: {
        OR: [{ blockerId: userId }, { blockedUserId: userId }],
      },
    });
    const blockedIds = blocks.map((b) => (b.blockerId === userId ? b.blockedUserId : b.blockerId));

    const excludeIds = [...interactedIds, ...blockedIds, userId];

    // Find potential matches
    const profiles = await this.prisma.profile.findMany({
      where: {
        userId: { notIn: excludeIds },
        user: { status: 'ACTIVE', onboardingCompleted: true },
        gender: { in: user.profile.genderPreferences },
        genderPreferences: { hasSome: [user.profile.gender] },
      },
      include: {
        user: { select: { id: true, lastActiveAt: true } },
        photos: { where: { isMain: true }, take: 1 },
        prompts: { take: 2 },
      },
      take: limit,
      orderBy: { profileStrengthScore: 'desc' },
    });

    // Calculate compatibility scores
    return profiles.map((profile) => ({
      ...profile,
      compatibility: this.calculateCompatibility(user.profile, profile),
    }));
  }

  async like(fromUserId: string, toUserId: string) {
    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: toUserId },
    });

    if (!targetUser || targetUser.status !== 'ACTIVE') {
      throw new NotFoundException('User not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
    });

    if (existingLike) {
      throw new BadRequestException('Already liked this user');
    }

    // Create like
    await this.prisma.like.create({
      data: { fromUserId, toUserId },
    });

    // Check for mutual like (match)
    const mutualLike = await this.prisma.like.findUnique({
      where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } },
    });

    if (mutualLike) {
      // Create match
      const profiles = await this.prisma.profile.findMany({
        where: { userId: { in: [fromUserId, toUserId] } },
      });

      const userProfile = profiles.find((p) => p.userId === fromUserId);
      const targetProfile = profiles.find((p) => p.userId === toUserId);

      const compatibility =
        userProfile && targetProfile
          ? this.calculateCompatibility(userProfile, targetProfile)
          : {
              overall: 70,
              values: 70,
              lifestyle: 70,
              intent: 70,
              communication: 70,
              logistics: 70,
              reasons: [],
              friction: null,
            };

      const match = await this.prisma.match.create({
        data: {
          userAId: fromUserId,
          userBId: toUserId,
          overallScore: compatibility.overall,
          valuesScore: compatibility.values,
          lifestyleScore: compatibility.lifestyle,
          intentScore: compatibility.intent,
          communicationScore: compatibility.communication,
          logisticsScore: compatibility.logistics,
          topReasons: compatibility.reasons,
          frictionPoint: compatibility.friction,
          confidenceLevel: 0.8,
        },
        include: {
          userA: { include: { profile: { include: { photos: { where: { isMain: true } } } } } },
          userB: { include: { profile: { include: { photos: { where: { isMain: true } } } } } },
        },
      });

      return { liked: true, matched: true, match };
    }

    return { liked: true, matched: false };
  }

  async pass(userId: string, targetUserId: string) {
    // Create a "pass" as a like with a flag (or separate table)
    // For simplicity, we'll just record it as seen
    try {
      await this.prisma.like.create({
        data: { fromUserId: userId, toUserId: targetUserId },
      });
    } catch (error) {
      // Only ignore unique constraint violation (P2002) - already exists
      // Re-throw any other errors (connection issues, validation errors, etc.)
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        // Already exists, ignore
      } else {
        throw error;
      }
    }

    return { passed: true };
  }

  async getMatches(userId: string) {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        isActive: true,
      },
      include: {
        userA: { include: { profile: { include: { photos: { where: { isMain: true } } } } } },
        userB: { include: { profile: { include: { photos: { where: { isMain: true } } } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return matches.map((match) => ({
      ...match,
      otherUser: match.userAId === userId ? match.userB : match.userA,
      lastMessage: match.messages[0] || null,
    }));
  }

  async getMatch(userId: string, matchId: string) {
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: { include: { profile: { include: { photos: true, prompts: true } } } },
        userB: { include: { profile: { include: { photos: true, prompts: true } } } },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return {
      ...match,
      otherUser: match.userAId === userId ? match.userB : match.userA,
    };
  }

  private calculateCompatibility(profile1: any, profile2: any) {
    // Values score (35%)
    const values1 = profile1.values?.top || [];
    const values2 = profile2.values?.top || [];
    const sharedValues = values1.filter((v: string) => values2.includes(v));
    const valuesScore = Math.min(
      100,
      (sharedValues.length / Math.max(values1.length, 1)) * 100 + 30,
    );

    // Lifestyle score (25%)
    const lifestyle1 = profile1.lifestyle || {};
    const lifestyle2 = profile2.lifestyle || {};
    let lifestyleScore = 70;
    if (lifestyle1.fitness && lifestyle2.fitness) {
      const fitnessDiff = Math.abs(lifestyle1.fitness - lifestyle2.fitness);
      lifestyleScore = 100 - fitnessDiff * 5;
    }

    // Intent score (20%)
    const intentScore = profile1.relationshipIntent === profile2.relationshipIntent ? 100 : 60;

    // Communication score (15%) - default
    const communicationScore = 75;

    // Logistics score (5%) - based on location
    let logisticsScore = 70;
    if (profile1.city === profile2.city) logisticsScore = 100;
    else if (profile1.state === profile2.state) logisticsScore = 85;

    // Overall weighted score
    const overall = Math.round(
      valuesScore * 0.35 +
        lifestyleScore * 0.25 +
        intentScore * 0.2 +
        communicationScore * 0.15 +
        logisticsScore * 0.05,
    );

    // Generate reasons
    const reasons: string[] = [];
    if (sharedValues.length > 0) {
      reasons.push(`Shared values: ${sharedValues.slice(0, 2).join(', ')}`);
    }
    if (intentScore === 100) {
      reasons.push('Looking for the same type of relationship');
    }
    if (logisticsScore >= 85) {
      reasons.push('Located nearby');
    }

    // Identify friction points
    let friction: string | null = null;
    if (intentScore < 70) {
      friction = 'Different relationship goals';
    } else if (lifestyleScore < 60) {
      friction = 'Different lifestyle preferences';
    }

    return {
      overall,
      values: Math.round(valuesScore),
      lifestyle: Math.round(lifestyleScore),
      intent: intentScore,
      communication: communicationScore,
      logistics: logisticsScore,
      reasons: reasons.slice(0, 3),
      friction,
    };
  }
}
