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
exports.MatchingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MatchingService = class MatchingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDiscoveryProfiles(userId, limit = 10) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user?.profile) {
            throw new common_1.BadRequestException('Please complete your profile first');
        }
        const interacted = await this.prisma.like.findMany({
            where: { fromUserId: userId },
            select: { toUserId: true },
        });
        const interactedIds = interacted.map((l) => l.toUserId);
        const blocks = await this.prisma.block.findMany({
            where: {
                OR: [{ blockerId: userId }, { blockedUserId: userId }],
            },
        });
        const blockedIds = blocks.map((b) => (b.blockerId === userId ? b.blockedUserId : b.blockerId));
        const excludeIds = [...interactedIds, ...blockedIds, userId];
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
        return profiles.map((profile) => ({
            ...profile,
            compatibility: this.calculateCompatibility(user.profile, profile),
        }));
    }
    async like(fromUserId, toUserId) {
        const targetUser = await this.prisma.user.findUnique({
            where: { id: toUserId },
        });
        if (!targetUser || targetUser.status !== 'ACTIVE') {
            throw new common_1.NotFoundException('User not found');
        }
        const existingLike = await this.prisma.like.findUnique({
            where: { fromUserId_toUserId: { fromUserId, toUserId } },
        });
        if (existingLike) {
            throw new common_1.BadRequestException('Already liked this user');
        }
        await this.prisma.like.create({
            data: { fromUserId, toUserId },
        });
        const mutualLike = await this.prisma.like.findUnique({
            where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } },
        });
        if (mutualLike) {
            const profiles = await this.prisma.profile.findMany({
                where: { userId: { in: [fromUserId, toUserId] } },
            });
            const userProfile = profiles.find((p) => p.userId === fromUserId);
            const targetProfile = profiles.find((p) => p.userId === toUserId);
            const compatibility = userProfile && targetProfile
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
    async pass(userId, targetUserId) {
        await this.prisma.like
            .create({
            data: { fromUserId: userId, toUserId: targetUserId },
        })
            .catch(() => {
        });
        return { passed: true };
    }
    async getMatches(userId) {
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
    async getMatch(userId, matchId) {
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
            throw new common_1.NotFoundException('Match not found');
        }
        return {
            ...match,
            otherUser: match.userAId === userId ? match.userB : match.userA,
        };
    }
    calculateCompatibility(profile1, profile2) {
        const values1 = profile1.values?.top || [];
        const values2 = profile2.values?.top || [];
        const sharedValues = values1.filter((v) => values2.includes(v));
        const valuesScore = Math.min(100, (sharedValues.length / Math.max(values1.length, 1)) * 100 + 30);
        const lifestyle1 = profile1.lifestyle || {};
        const lifestyle2 = profile2.lifestyle || {};
        let lifestyleScore = 70;
        if (lifestyle1.fitness && lifestyle2.fitness) {
            const fitnessDiff = Math.abs(lifestyle1.fitness - lifestyle2.fitness);
            lifestyleScore = 100 - fitnessDiff * 5;
        }
        const intentScore = profile1.relationshipIntent === profile2.relationshipIntent ? 100 : 60;
        const communicationScore = 75;
        let logisticsScore = 70;
        if (profile1.city === profile2.city)
            logisticsScore = 100;
        else if (profile1.state === profile2.state)
            logisticsScore = 85;
        const overall = Math.round(valuesScore * 0.35 +
            lifestyleScore * 0.25 +
            intentScore * 0.2 +
            communicationScore * 0.15 +
            logisticsScore * 0.05);
        const reasons = [];
        if (sharedValues.length > 0) {
            reasons.push(`Shared values: ${sharedValues.slice(0, 2).join(', ')}`);
        }
        if (intentScore === 100) {
            reasons.push('Looking for the same type of relationship');
        }
        if (logisticsScore >= 85) {
            reasons.push('Located nearby');
        }
        let friction = null;
        if (intentScore < 70) {
            friction = 'Different relationship goals';
        }
        else if (lifestyleScore < 60) {
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
};
exports.MatchingService = MatchingService;
exports.MatchingService = MatchingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchingService);
//# sourceMappingURL=matching.service.js.map