import { MatchingService } from './matching.service';
export declare class MatchingController {
    private matchingService;
    constructor(matchingService: MatchingService);
    discover(req: any, limit?: number): Promise<{
        compatibility: {
            overall: number;
            values: number;
            lifestyle: number;
            intent: number;
            communication: number;
            logistics: number;
            reasons: string[];
            friction: string | null;
        };
        user: {
            id: string;
            lastActiveAt: Date | null;
        };
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
    }[]>;
    like(req: any, userId: string): Promise<{
        liked: boolean;
        matched: boolean;
        match: {
            userA: {
                profile: ({
                    photos: {
                        id: string;
                        order: number;
                        createdAt: Date;
                        url: string;
                        isMain: boolean;
                        isVerified: boolean;
                        profileId: string;
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
                }) | null;
            } & {
                id: string;
                createdAt: Date;
                email: string;
                passwordHash: string;
                status: import(".prisma/client").$Enums.UserStatus;
                onboardingCompleted: boolean;
                emailVerified: boolean;
                phoneVerified: boolean;
                lastActiveAt: Date | null;
                updatedAt: Date;
            };
            userB: {
                profile: ({
                    photos: {
                        id: string;
                        order: number;
                        createdAt: Date;
                        url: string;
                        isMain: boolean;
                        isVerified: boolean;
                        profileId: string;
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
                }) | null;
            } & {
                id: string;
                createdAt: Date;
                email: string;
                passwordHash: string;
                status: import(".prisma/client").$Enums.UserStatus;
                onboardingCompleted: boolean;
                emailVerified: boolean;
                phoneVerified: boolean;
                lastActiveAt: Date | null;
                updatedAt: Date;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            overallScore: number;
            valuesScore: number;
            lifestyleScore: number;
            intentScore: number;
            communicationScore: number;
            logisticsScore: number;
            topReasons: string[];
            frictionPoint: string | null;
            confidenceLevel: number | null;
            userAId: string;
            userBId: string;
        };
    } | {
        liked: boolean;
        matched: boolean;
        match?: undefined;
    }>;
    pass(req: any, userId: string): Promise<{
        passed: boolean;
    }>;
    getMatches(req: any): Promise<{
        otherUser: {
            profile: ({
                photos: {
                    id: string;
                    order: number;
                    createdAt: Date;
                    url: string;
                    isMain: boolean;
                    isVerified: boolean;
                    profileId: string;
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            status: import(".prisma/client").$Enums.UserStatus;
            onboardingCompleted: boolean;
            emailVerified: boolean;
            phoneVerified: boolean;
            lastActiveAt: Date | null;
            updatedAt: Date;
        };
        lastMessage: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.MessageStatus;
            content: string;
            safetyScore: number | null;
            safetyFlags: string[];
            readAt: Date | null;
            matchId: string;
            senderId: string;
            receiverId: string;
        };
        userA: {
            profile: ({
                photos: {
                    id: string;
                    order: number;
                    createdAt: Date;
                    url: string;
                    isMain: boolean;
                    isVerified: boolean;
                    profileId: string;
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            status: import(".prisma/client").$Enums.UserStatus;
            onboardingCompleted: boolean;
            emailVerified: boolean;
            phoneVerified: boolean;
            lastActiveAt: Date | null;
            updatedAt: Date;
        };
        userB: {
            profile: ({
                photos: {
                    id: string;
                    order: number;
                    createdAt: Date;
                    url: string;
                    isMain: boolean;
                    isVerified: boolean;
                    profileId: string;
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            status: import(".prisma/client").$Enums.UserStatus;
            onboardingCompleted: boolean;
            emailVerified: boolean;
            phoneVerified: boolean;
            lastActiveAt: Date | null;
            updatedAt: Date;
        };
        messages: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.MessageStatus;
            content: string;
            safetyScore: number | null;
            safetyFlags: string[];
            readAt: Date | null;
            matchId: string;
            senderId: string;
            receiverId: string;
        }[];
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        overallScore: number;
        valuesScore: number;
        lifestyleScore: number;
        intentScore: number;
        communicationScore: number;
        logisticsScore: number;
        topReasons: string[];
        frictionPoint: string | null;
        confidenceLevel: number | null;
        userAId: string;
        userBId: string;
    }[]>;
    getMatch(req: any, matchId: string): Promise<{
        otherUser: {
            profile: ({
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            status: import(".prisma/client").$Enums.UserStatus;
            onboardingCompleted: boolean;
            emailVerified: boolean;
            phoneVerified: boolean;
            lastActiveAt: Date | null;
            updatedAt: Date;
        };
        userA: {
            profile: ({
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            status: import(".prisma/client").$Enums.UserStatus;
            onboardingCompleted: boolean;
            emailVerified: boolean;
            phoneVerified: boolean;
            lastActiveAt: Date | null;
            updatedAt: Date;
        };
        userB: {
            profile: ({
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            status: import(".prisma/client").$Enums.UserStatus;
            onboardingCompleted: boolean;
            emailVerified: boolean;
            phoneVerified: boolean;
            lastActiveAt: Date | null;
            updatedAt: Date;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        overallScore: number;
        valuesScore: number;
        lifestyleScore: number;
        intentScore: number;
        communicationScore: number;
        logisticsScore: number;
        topReasons: string[];
        frictionPoint: string | null;
        confidenceLevel: number | null;
        userAId: string;
        userBId: string;
    }>;
}
