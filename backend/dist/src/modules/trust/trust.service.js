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
exports.TrustService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TrustService = class TrustService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTrustScore(userId) {
        let trustScore = await this.prisma.trustScore.findUnique({
            where: { userId },
        });
        if (!trustScore) {
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
    async logBehavior(userId, behaviorType, metadata) {
        const score = this.getBehaviorScore(behaviorType);
        await this.prisma.behaviorLog.create({
            data: {
                userId,
                behaviorType: behaviorType,
                metadata,
                score,
            },
        });
        await this.recalculateTrustScore(userId);
    }
    async recalculateTrustScore(userId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const behaviors = await this.prisma.behaviorLog.findMany({
            where: {
                userId,
                createdAt: { gte: thirtyDaysAgo },
            },
        });
        let replyPatternScore = 50;
        let commitmentScore = 50;
        let respectScore = 50;
        const toneConsistencyScore = 50;
        const messageBehaviors = behaviors.filter((b) => b.behaviorType === 'MESSAGE_SENT' || b.behaviorType === 'MESSAGE_RECEIVED');
        if (messageBehaviors.length > 0) {
            replyPatternScore = Math.min(100, 50 + messageBehaviors.length);
        }
        const commitmentBehaviors = behaviors.filter((b) => b.behaviorType === 'DATE_COMPLETED' || b.behaviorType === 'DATE_CANCELLED');
        const completed = commitmentBehaviors.filter((b) => b.behaviorType === 'DATE_COMPLETED').length;
        const cancelled = commitmentBehaviors.filter((b) => b.behaviorType === 'DATE_CANCELLED').length;
        if (completed + cancelled > 0) {
            commitmentScore = Math.round((completed / (completed + cancelled)) * 100);
        }
        const reportBehaviors = behaviors.filter((b) => b.behaviorType === 'REPORT_FILED');
        if (reportBehaviors.length > 0) {
            respectScore = Math.max(0, 100 - reportBehaviors.length * 20);
        }
        else {
            respectScore = 80;
        }
        const overall = Math.round(replyPatternScore * 0.25 +
            commitmentScore * 0.3 +
            respectScore * 0.3 +
            toneConsistencyScore * 0.15);
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
    getBehaviorScore(behaviorType) {
        const scores = {
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
};
exports.TrustService = TrustService;
exports.TrustService = TrustService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrustService);
//# sourceMappingURL=trust.service.js.map