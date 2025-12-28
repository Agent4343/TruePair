export declare class UpdateUserDto {
    email?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    status: string;
    onboardingCompleted: boolean;
    emailVerified: boolean;
    profile?: {
        id: string;
        firstName: string;
        displayName: string | null;
        bio: string | null;
        city: string | null;
        state: string | null;
        profileStrengthScore: number;
    };
}
