import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/profiles.dto';
export declare class ProfilesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateProfileDto): Promise<{
        photos: {
            id: string;
            order: number;
            createdAt: Date;
            url: string;
            isMain: boolean;
            isVerified: boolean;
            profileId: string;
        }[];
        prompts: {
            id: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            profileId: string;
            question: string;
            answer: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        displayName: string | null;
        birthDate: Date;
        gender: import(".prisma/client").$Enums.Gender;
        genderPreferences: import(".prisma/client").$Enums.Gender[];
        city: string | null;
        state: string | null;
        country: string | null;
        latitude: number | null;
        longitude: number | null;
        bio: string | null;
        height: number | null;
        relationshipIntent: import(".prisma/client").$Enums.RelationshipIntent | null;
        values: import("@prisma/client/runtime/library").JsonValue | null;
        lifestyle: import("@prisma/client/runtime/library").JsonValue | null;
        dealbreakers: import("@prisma/client/runtime/library").JsonValue | null;
        profileStrengthScore: number;
        completenessScore: number;
        specificityScore: number;
        consistencyScore: number;
        stabilityScore: number;
        userId: string;
    }>;
    findByUserId(userId: string): Promise<{
        photos: {
            id: string;
            order: number;
            createdAt: Date;
            url: string;
            isMain: boolean;
            isVerified: boolean;
            profileId: string;
        }[];
        prompts: {
            id: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            profileId: string;
            question: string;
            answer: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        displayName: string | null;
        birthDate: Date;
        gender: import(".prisma/client").$Enums.Gender;
        genderPreferences: import(".prisma/client").$Enums.Gender[];
        city: string | null;
        state: string | null;
        country: string | null;
        latitude: number | null;
        longitude: number | null;
        bio: string | null;
        height: number | null;
        relationshipIntent: import(".prisma/client").$Enums.RelationshipIntent | null;
        values: import("@prisma/client/runtime/library").JsonValue | null;
        lifestyle: import("@prisma/client/runtime/library").JsonValue | null;
        dealbreakers: import("@prisma/client/runtime/library").JsonValue | null;
        profileStrengthScore: number;
        completenessScore: number;
        specificityScore: number;
        consistencyScore: number;
        stabilityScore: number;
        userId: string;
    }>;
    update(userId: string, dto: UpdateProfileDto): Promise<{
        photos: {
            id: string;
            order: number;
            createdAt: Date;
            url: string;
            isMain: boolean;
            isVerified: boolean;
            profileId: string;
        }[];
        prompts: {
            id: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            profileId: string;
            question: string;
            answer: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        displayName: string | null;
        birthDate: Date;
        gender: import(".prisma/client").$Enums.Gender;
        genderPreferences: import(".prisma/client").$Enums.Gender[];
        city: string | null;
        state: string | null;
        country: string | null;
        latitude: number | null;
        longitude: number | null;
        bio: string | null;
        height: number | null;
        relationshipIntent: import(".prisma/client").$Enums.RelationshipIntent | null;
        values: import("@prisma/client/runtime/library").JsonValue | null;
        lifestyle: import("@prisma/client/runtime/library").JsonValue | null;
        dealbreakers: import("@prisma/client/runtime/library").JsonValue | null;
        profileStrengthScore: number;
        completenessScore: number;
        specificityScore: number;
        consistencyScore: number;
        stabilityScore: number;
        userId: string;
    }>;
    getProfileStrength(userId: string): Promise<{
        overall: number;
        breakdown: {
            completeness: number;
            specificity: number;
            consistency: number;
            stability: number;
        };
        tips: string[];
    }>;
    addPhoto(userId: string, url: string, isMain?: boolean): Promise<{
        id: string;
        order: number;
        createdAt: Date;
        url: string;
        isMain: boolean;
        isVerified: boolean;
        profileId: string;
    }>;
    deletePhoto(userId: string, photoId: string): Promise<{
        message: string;
    }>;
    addPrompt(userId: string, question: string, answer: string): Promise<{
        id: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        profileId: string;
        question: string;
        answer: string;
    }>;
    private calculateProfileStrength;
    private getImprovementTips;
}
