import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/profiles.dto';
import { Gender, RelationshipIntent } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProfileDto) {
    // Check if profile already exists
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('Profile already exists');
    }

    const profile = await this.prisma.profile.create({
      data: {
        userId,
        firstName: dto.firstName,
        displayName: dto.displayName || dto.firstName,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender as Gender,
        genderPreferences: dto.genderPreferences as Gender[],
        city: dto.city,
        state: dto.state,
        country: dto.country,
        bio: dto.bio,
        height: dto.height,
        relationshipIntent: dto.relationshipIntent as RelationshipIntent,
        values: dto.values,
        lifestyle: dto.lifestyle,
        dealbreakers: dto.dealbreakers,
      },
      include: {
        photos: true,
        prompts: true,
      },
    });

    // Calculate initial profile strength
    await this.calculateProfileStrength(profile.id);

    return profile;
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        photos: { orderBy: { order: 'asc' } },
        prompts: { orderBy: { order: 'asc' } },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
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
          relationshipIntent: dto.relationshipIntent as RelationshipIntent,
        }),
        ...(dto.values && { values: dto.values }),
        ...(dto.lifestyle && { lifestyle: dto.lifestyle }),
        ...(dto.dealbreakers && { dealbreakers: dto.dealbreakers }),
        ...(dto.genderPreferences && { genderPreferences: dto.genderPreferences as Gender[] }),
      },
      include: {
        photos: { orderBy: { order: 'asc' } },
        prompts: { orderBy: { order: 'asc' } },
      },
    });

    // Recalculate profile strength
    await this.calculateProfileStrength(updated.id);

    return updated;
  }

  async getProfileStrength(userId: string) {
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
      throw new NotFoundException('Profile not found');
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

  async addPhoto(userId: string, url: string, isMain: boolean = false) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.photos.length >= 6) {
      throw new BadRequestException('Maximum 6 photos allowed');
    }

    // If this is the main photo, unset other main photos
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

  async deletePhoto(userId: string, photoId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const photo = await this.prisma.photo.findFirst({
      where: { id: photoId, profileId: profile.id },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.prisma.photo.delete({
      where: { id: photoId },
    });

    await this.calculateProfileStrength(profile.id);

    return { message: 'Photo deleted' };
  }

  async addPrompt(userId: string, question: string, answer: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { prompts: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.prompts.length >= 3) {
      throw new BadRequestException('Maximum 3 prompts allowed');
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

  private async calculateProfileStrength(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        photos: true,
        prompts: true,
      },
    });

    if (!profile) return;

    // Completeness score (0-100)
    let completeness = 0;
    if (profile.firstName) completeness += 10;
    if (profile.bio && profile.bio.length > 50) completeness += 20;
    if (profile.photos.length > 0) completeness += 20;
    if (profile.photos.length >= 3) completeness += 10;
    if (profile.prompts.length > 0) completeness += 15;
    if (profile.prompts.length >= 2) completeness += 10;
    if (profile.relationshipIntent) completeness += 10;
    if (profile.city) completeness += 5;

    // Specificity score (based on bio and prompt answer length/detail)
    let specificity = 50;
    if (profile.bio && profile.bio.length > 100) specificity += 20;
    if (profile.bio && profile.bio.length > 200) specificity += 15;
    if (profile.prompts.some((p) => p.answer.length > 50)) specificity += 15;

    // Consistency and stability (default to high for new profiles)
    const consistency = 80;
    const stability = 90;

    // Overall score (weighted average)
    const overall = Math.round(
      completeness * 0.25 + specificity * 0.25 + consistency * 0.2 + stability * 0.15 + 50 * 0.15, // behavior score placeholder
    );

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

  private getImprovementTips(profile: any): string[] {
    const tips: string[] = [];

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
}
