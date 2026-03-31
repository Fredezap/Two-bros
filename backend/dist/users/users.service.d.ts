import { PrismaService } from '../prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { EmailService } from './email.service';
import { JwtService } from './jwt.service';
export declare class UsersService {
    private prisma;
    private emailService;
    private jwtService;
    constructor(prisma: PrismaService, emailService: EmailService, jwtService: JwtService);
    register(dto: RegisterUserDto): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    login(dto: {
        email: string;
        password: string;
        deviceId: string;
        deviceName?: string;
        ip?: string;
        userAgent?: string;
        res?: any;
    }): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            isEmailVerified: boolean;
            failedLoginAttempts: number;
            lockUntil: Date | null;
            lastLoginAt: Date | null;
            lastLoginIp: string | null;
            createdAt: Date;
        };
        accessToken: string;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, newPassword: string): Promise<{
        message: string;
    }>;
    refreshAccessToken(refreshToken: string, req: any, res: any): Promise<{
        accessToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    unlockAccountByToken(token: string): Promise<{
        message: string;
    }>;
}
