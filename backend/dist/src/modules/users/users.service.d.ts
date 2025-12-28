import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto, ChangePasswordDto } from './dto/users.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(userId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        status: import(".prisma/client").$Enums.UserStatus;
        onboardingCompleted: boolean;
        emailVerified: boolean;
        phoneVerified: boolean;
        lastActiveAt: Date | null;
        profile: {
            id: string;
            firstName: string;
            displayName: string | null;
            city: string | null;
            state: string | null;
            bio: string | null;
            profileStrengthScore: number;
        } | null;
    }>;
    findByEmail(email: string): Promise<{
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
    } | null>;
    update(userId: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.UserStatus;
        onboardingCompleted: boolean;
        emailVerified: boolean;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deactivate(userId: string): Promise<{
        message: string;
    }>;
    reactivate(userId: string): Promise<{
        message: string;
    }>;
    updateLastActive(userId: string): Promise<void>;
    completeOnboarding(userId: string): Promise<{
        message: string;
    }>;
    delete(userId: string): Promise<{
        message: string;
    }>;
    private validatePassword;
}
