import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        onboardingCompleted: boolean;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    refresh(req: any): Promise<{
        accessToken: string;
    }>;
}
