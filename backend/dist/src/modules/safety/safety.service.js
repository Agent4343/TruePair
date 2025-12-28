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
exports.SafetyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let SafetyService = class SafetyService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async reportUser(reporterId, reportedUserId, type, description) {
        if (reporterId === reportedUserId) {
            throw new common_1.BadRequestException('Cannot report yourself');
        }
        const reportedUser = await this.prisma.user.findUnique({
            where: { id: reportedUserId },
        });
        if (!reportedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        const report = await this.prisma.report.create({
            data: {
                reporterId,
                reportedUserId,
                type: type,
                description,
            },
        });
        await this.updateRiskAssessment(reportedUserId);
        return { message: 'Report submitted successfully', reportId: report.id };
    }
    async getSafetySignals(userId) {
        const signals = await this.prisma.safetySignal.findMany({
            where: { userId },
        });
        return signals.map((signal) => ({
            type: signal.signalType,
            verifiedAt: signal.verifiedAt,
            label: this.getSignalLabel(signal.signalType),
        }));
    }
    async getPreDateSafetyCheck(userId, matchId) {
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
            throw new common_1.NotFoundException('Match not found');
        }
        const otherUserId = match.userAId === userId ? match.userBId : match.userAId;
        const messageContent = match.messages.map((m) => m.content).join('\n');
        const analysis = await this.aiService.analyzeText(messageContent, 'safety');
        const otherUserSignals = await this.getSafetySignals(otherUserId);
        const suggestions = [
            'Meet in a public place for your first date',
            "Tell a friend where you're going and when",
            'Enable location sharing with a trusted contact',
            'Arrange your own transportation',
        ];
        const concerns = [];
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
            recommendation: analysis.score >= 80 ? 'LOW_RISK' : analysis.score >= 60 ? 'MODERATE' : 'CAUTION',
        };
    }
    async scheduleDate(userId, matchId, dateTime, location, isPublicPlace) {
        const match = await this.prisma.match.findFirst({
            where: {
                id: matchId,
                OR: [{ userAId: userId }, { userBId: userId }],
            },
        });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
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
    async blockUser(blockerId, blockedUserId, reason) {
        if (blockerId === blockedUserId) {
            throw new common_1.BadRequestException('Cannot block yourself');
        }
        const blockedUser = await this.prisma.user.findUnique({
            where: { id: blockedUserId },
        });
        if (!blockedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.block.upsert({
            where: { blockerId_blockedUserId: { blockerId, blockedUserId } },
            create: { blockerId, blockedUserId, reason },
            update: { reason },
        });
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
    async updateRiskAssessment(userId) {
        const reports = await this.prisma.report.count({
            where: { reportedUserId: userId },
        });
        const reportScore = Math.min(100, reports * 20);
        const flaggedMessages = await this.prisma.message.findMany({
            where: { senderId: userId, safetyScore: { lt: 70 } },
            select: { safetyScore: true },
        });
        const messageRiskScore = flaggedMessages.length > 0
            ? Math.round(100 -
                flaggedMessages.reduce((sum, m) => sum + (m.safetyScore || 100), 0) /
                    flaggedMessages.length)
            : 0;
        const riskIndex = Math.round(reportScore * 0.4 + messageRiskScore * 0.35 + 0 * 0.25);
        let riskLevel = 'NORMAL';
        if (riskIndex >= 80)
            riskLevel = 'MANUAL_REVIEW';
        else if (riskIndex >= 60)
            riskLevel = 'RESTRICTED';
        else if (riskIndex >= 30)
            riskLevel = 'MONITOR';
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
    getSignalLabel(signalType) {
        const labels = {
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
};
exports.SafetyService = SafetyService;
exports.SafetyService = SafetyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService])
], SafetyService);
//# sourceMappingURL=safety.service.js.map