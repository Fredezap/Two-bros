/// <reference types="cookie-parser" />
import { PrismaService } from '../prisma.service';
import { Request, Response } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from './users.service';
type JwtPayload = {
    sub: string;
    email: string;
};
interface RequestWithUser extends Request {
    user?: JwtPayload;
}
export declare class UsersController {
    private readonly usersService;
    private readonly prisma;
    constructor(usersService: UsersService, prisma: PrismaService);
    verifyEmailToken(dto: {
        token: string;
    }): Promise<{
        message: string;
    }>;
    sendUnlockEmail(dto: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPasswordToken(dto: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    register(dto: RegisterUserDto): Promise<{
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    login(dto: LoginUserDto, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    changePassword(req: RequestWithUser, dto: {
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    resendVerification(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    me(req: RequestWithUser): Promise<JwtPayload>;
    refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    logout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    unlockAccount(token: string): Promise<{
        message: string;
    }>;
}
export {};
