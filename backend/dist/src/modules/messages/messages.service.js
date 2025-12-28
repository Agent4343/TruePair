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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let MessagesService = class MessagesService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async getMessages(userId, matchId, limit = 50, before) {
        const match = await this.prisma.match.findFirst({
            where: {
                id: matchId,
                OR: [{ userAId: userId }, { userBId: userId }],
            },
        });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
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
    async sendMessage(userId, matchId, content) {
        const match = await this.prisma.match.findFirst({
            where: {
                id: matchId,
                OR: [{ userAId: userId }, { userBId: userId }],
                isActive: true,
            },
        });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        const receiverId = match.userAId === userId ? match.userBId : match.userAId;
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
        await this.prisma.match.update({
            where: { id: matchId },
            data: { updatedAt: new Date() },
        });
        return message;
    }
    async markAsRead(userId, matchId) {
        const match = await this.prisma.match.findFirst({
            where: {
                id: matchId,
                OR: [{ userAId: userId }, { userBId: userId }],
            },
        });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
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
    async getUnreadCount(userId) {
        const count = await this.prisma.message.count({
            where: {
                receiverId: userId,
                readAt: null,
            },
        });
        return { unreadCount: count };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map