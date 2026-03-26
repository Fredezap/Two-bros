import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from './users.service';
import { Body, Controller, Post, Req, Get, UseGuards, Res } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

type JwtPayload = { sub: string; email: string };

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}
  @Post('verify-email-token')
  async verifyEmailToken(@Body() dto: { token: string }) {
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: dto.token,
        type: 'VERIFY_EMAIL',
        expiresAt: { gt: new Date() },
      },
    });
    if (!tokenRecord) throw new Error('Token inválido o expirado');
    const user = await this.prisma.user.findUnique({ where: { id: tokenRecord.userId } });
    if (!user) throw new Error('Usuario no encontrado');
    if (user.isEmailVerified) {
      await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      return { message: 'El email ya está verificado.' };
    }
    await this.prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { isEmailVerified: true },
    });
    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    return { message: 'Email verificado correctamente.' };
  }

  @Post('reset-password-token')
  async resetPasswordToken(@Body() dto: { token: string; newPassword: string }) {
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: dto.token,
        type: 'RESET_PASSWORD',
        expiresAt: { gt: new Date() },
      },
    });
    if (!tokenRecord) throw new Error('Token inválido o expirado');
    const user = await this.prisma.user.findUnique({ where: { id: tokenRecord.userId } });
    if (!user) throw new Error('Usuario no encontrado');
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });
    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    return { message: 'Contraseña restablecida correctamente.' };
  }

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.usersService.register(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.usersService.verifyEmail(dto.token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Req() req: Request, @Res() res: Response) {
    // Extraer IP y user-agent del request
    let ip = req.ip;
    const xff = req.headers['x-forwarded-for'];
    if (Array.isArray(xff)) ip = xff[0];
    else if (typeof xff === 'string') ip = xff;

    let userAgent: string | undefined = undefined;
    const ua = req.headers['user-agent'];
    if (Array.isArray(ua)) userAgent = ua[0];
    else if (typeof ua === 'string') userAgent = ua;

    const result = await this.usersService.login({ ...dto, ip, userAgent, res });
    return res.json(result);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: RequestWithUser, @Body() dto: { newPassword: string }) {
    if (!req.user) throw new Error('No user in request');
    return this.usersService.changePassword(req.user.sub, dto.newPassword);
  }

  @Post('resend-verification')
  async resendVerification(@Body() dto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(dto.email); // reutiliza lógica para enviar token
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: RequestWithUser) {
    if (!req.user) throw new Error('No user in request');
    return req.user;
  }

    @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
    const result = await this.usersService.refreshAccessToken(refreshToken, req, res);
    return res.json(result);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) await this.usersService.logout(refreshToken);
    res.clearCookie('refresh_token', { path: '/' });
    return res.json({ message: 'Logout exitoso' });
  }
  
    @Post('unlock-account')
  async unlockAccount(@Body('token') token: string) {
    return this.usersService.unlockAccountByToken(token);
  }
}
