import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dto/users.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<{
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
    updateMe(req: any, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.UserStatus;
        onboardingCompleted: boolean;
        emailVerified: boolean;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deactivate(req: any): Promise<{
        message: string;
    }>;
    reactivate(req: any): Promise<{
        message: string;
    }>;
    delete(req: any): Promise<{
        message: string;
    }>;
}
