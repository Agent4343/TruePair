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
exports.ProfilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProfilesService = class ProfilesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const existing = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (existing) {
            throw new common_1.BadRequestException('Profile already exists');
        }
        const profile = await this.prisma.profile.create({
            data: {
                userId,
                firstName: dto.firstName,
                displayName: dto.displayName || dto.firstName,
                birthDate: new Date(dto.birthDate),
                gender: dto.gender,
                genderPreferences: dto.genderPreferences,
                city: dto.city,
                state: dto.state,
                country: dto.country,
                bio: dto.bio,
                height: dto.height,
                relationshipIntent: dto.relationshipIntent,
                values: dto.values,
                lifestyle: dto.lifestyle,
                dealbreakers: dto.dealbreakers,
            },
            include: {
                photos: true,
                prompts: true,
            },
        });
        await this.calculateProfileStrength(profile.id);
        return profile;
    }
    async findByUserId(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            include: {
                photos: { orderBy: { order: 'asc' } },
                prompts: { orderBy: { order: 'asc' } },
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return profile;
    }
    async update(userId, dto) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        const updated = await this.prisma.profile.update({
            where: { userId },
            data: {
                ...(dto.firstName && { firstName: dto.firstName }),
                ...(dto.displayName && { displayName: dto.displayName }),
                ...(dto.bio !== undefined && { bio: dto.bio }),
                ...(dto.city !== undefined && { city: dto.city }),
                ...(dto.state !== undefined && { state: dto.state }),
                ...(dto.country !== undefined && { country: dto.country }),
                ...(dto.height !== undefined && { height: dto.height }),
                ...(dto.relationshipIntent && {
                    relationshipIntent: dto.relationshipIntent,
                }),
                ...(dto.values && { values: dto.values }),
                ...(dto.lifestyle && { lifestyle: dto.lifestyle }),
                ...(dto.dealbreakers && { dealbreakers: dto.dealbreakers }),
                ...(dto.genderPreferences && { genderPreferences: dto.genderPreferences }),
            },
            include: {
                photos: { orderBy: { order: 'asc' } },
                prompts: { orderBy: { order: 'asc' } },
            },
        });
        await this.calculateProfileStrength(updated.id);
        return updated;
    }
    async getProfileStrength(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: {
                profileStrengthScore: true,
                completenessScore: true,
                specificityScore: true,
                consistencyScore: true,
                stabilityScore: true,
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        const tips = this.getImprovementTips(profile);
        return {
            overall: profile.profileStrengthScore,
            breakdown: {
                completeness: profile.completenessScore,
                specificity: profile.specificityScore,
                consistency: profile.consistencyScore,
                stability: profile.stabilityScore,
            },
            tips,
        };
    }
    async addPhoto(userId, url, isMain = false) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            include: { photos: true },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        if (profile.photos.length >= 6) {
            throw new common_1.BadRequestException('Maximum 6 photos allowed');
        }
        if (isMain) {
            await this.prisma.photo.updateMany({
                where: { profileId: profile.id },
                data: { isMain: false },
            });
        }
        const photo = await this.prisma.photo.create({
            data: {
                profileId: profile.id,
                url,
                isMain: isMain || profile.photos.length === 0,
                order: profile.photos.length,
            },
        });
        await this.calculateProfileStrength(profile.id);
        return photo;
    }
    async deletePhoto(userId, photoId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        const photo = await this.prisma.photo.findFirst({
            where: { id: photoId, profileId: profile.id },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found');
        }
        await this.prisma.photo.delete({
            where: { id: photoId },
        });
        await this.calculateProfileStrength(profile.id);
        return { message: 'Photo deleted' };
    }
    async addPrompt(userId, question, answer) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            include: { prompts: true },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        if (profile.prompts.length >= 3) {
            throw new common_1.BadRequestException('Maximum 3 prompts allowed');
        }
        const prompt = await this.prisma.profilePrompt.create({
            data: {
                profileId: profile.id,
                question,
                answer,
                order: profile.prompts.length,
            },
        });
        await this.calculateProfileStrength(profile.id);
        return prompt;
    }
    async calculateProfileStrength(profileId) {
        const profile = await this.prisma.profile.findUnique({
            where: { id: profileId },
            include: {
                photos: true,
                prompts: true,
            },
        });
        if (!profile)
            return;
        let completeness = 0;
        if (profile.firstName)
            completeness += 10;
        if (profile.bio && profile.bio.length > 50)
            completeness += 20;
        if (profile.photos.length > 0)
            completeness += 20;
        if (profile.photos.length >= 3)
            completeness += 10;
        if (profile.prompts.length > 0)
            completeness += 15;
        if (profile.prompts.length >= 2)
            completeness += 10;
        if (profile.relationshipIntent)
            completeness += 10;
        if (profile.city)
            completeness += 5;
        let specificity = 50;
        if (profile.bio && profile.bio.length > 100)
            specificity += 20;
        if (profile.bio && profile.bio.length > 200)
            specificity += 15;
        if (profile.prompts.some((p) => p.answer.length > 50))
            specificity += 15;
        const consistency = 80;
        const stability = 90;
        const overall = Math.round(completeness * 0.25 + specificity * 0.25 + consistency * 0.2 + stability * 0.15 + 50 * 0.15);
        await this.prisma.profile.update({
            where: { id: profileId },
            data: {
                profileStrengthScore: overall,
                completenessScore: completeness,
                specificityScore: specificity,
                consistencyScore: consistency,
                stabilityScore: stability,
            },
        });
    }
    getImprovementTips(profile) {
        const tips = [];
        if (profile.completenessScore < 80) {
            tips.push('Add more photos to increase your visibility');
            tips.push('Complete all profile sections for better matches');
        }
        if (profile.specificityScore < 70) {
            tips.push('Add more detail to your bio to stand out');
            tips.push('Write longer, more thoughtful prompt answers');
        }
        if (tips.length === 0) {
            tips.push('Your profile is looking great!');
        }
        return tips.slice(0, 3);
    }
};
exports.ProfilesService = ProfilesService;
exports.ProfilesService = ProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfilesService);
//# sourceMappingURL=profiles.service.js.map