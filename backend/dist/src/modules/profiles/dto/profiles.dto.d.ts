export declare class CreateProfileDto {
    firstName: string;
    displayName?: string;
    birthDate: string;
    gender: string;
    genderPreferences: string[];
    city?: string;
    state?: string;
    country?: string;
    bio?: string;
    height?: number;
    relationshipIntent?: string;
    values?: Record<string, any>;
    lifestyle?: Record<string, any>;
    dealbreakers?: Record<string, any>;
}
export declare class UpdateProfileDto {
    firstName?: string;
    displayName?: string;
    city?: string;
    state?: string;
    country?: string;
    bio?: string;
    height?: number;
    relationshipIntent?: string;
    genderPreferences?: string[];
    values?: Record<string, any>;
    lifestyle?: Record<string, any>;
    dealbreakers?: Record<string, any>;
}
export declare class AddPhotoDto {
    url: string;
    isMain?: boolean;
}
export declare class AddPromptDto {
    question: string;
    answer: string;
}
