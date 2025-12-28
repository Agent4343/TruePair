import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto, AddPhotoDto, AddPromptDto } from './dto/profiles.dto';
export declare class ProfilesController {
    private profilesService;
    constructor(profilesService: ProfilesService);
    create(req: any, dto: CreateProfileDto): Promise<{
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
    getProfile(req: any): Promise<{
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
    update(req: any, dto: UpdateProfileDto): Promise<{
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
    getScore(req: any): Promise<{
        overall: number;
        breakdown: {
            completeness: number;
            specificity: number;
            consistency: number;
            stability: number;
        };
        tips: string[];
    }>;
    addPhoto(req: any, dto: AddPhotoDto): Promise<{
        id: string;
        order: number;
        createdAt: Date;
        url: string;
        isMain: boolean;
        isVerified: boolean;
        profileId: string;
    }>;
    deletePhoto(req: any, photoId: string): Promise<{
        message: string;
    }>;
    addPrompt(req: any, dto: AddPromptDto): Promise<{
        id: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        profileId: string;
        question: string;
        answer: string;
    }>;
}
