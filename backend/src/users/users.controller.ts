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

    @Post('send-unlock-email')
  async sendUnlockEmail(@Body() dto: { email: string }) {
    console.log('POST /users/send-unlock-email recibido. Email:', dto.email);
    // Buscar usuario
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
    console.log('Usuario encontrado:', user ? user.email : null);
    if (!user) {
      console.log('No se encontró el usuario');
      return { success: false, message: 'Usuario no encontrado.' };
    }
    // Validar si la cuenta está bloqueada
    if (!user.lockUntil || user.lockUntil < new Date()) {
      console.log('La cuenta no está bloqueada actualmente. No es necesario desbloquear. lockUntil:', user.lockUntil, 'now:', new Date());
      return { success: false, message: 'La cuenta ya no está bloqueada. Intenta iniciar sesión normalmente.' };
    }
    // Generar nuevo token de desbloqueo y reenviar email
    const unlockToken = require('uuid').v4();
    const unlockTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    console.log('Token generado/enviado:', unlockToken, 'Expira:', unlockTokenExpires);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: unlockToken, verificationTokenExpires: unlockTokenExpires },
    });
    console.log('Antes de enviar email de desbloqueo...');
    try {
      await this.usersService['emailService'].sendAccountLockedEmail(user.email, unlockToken);
      console.log('Email de desbloqueo enviado a:', user.email);
    } catch (err) {
      console.error('Error enviando email de desbloqueo:', err);
      return { success: false, message: 'Error enviando email de desbloqueo.' };
    }
    return { success: true, message: 'Correo de desbloqueo reenviado.' };
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
    const res = await this.usersService.register(dto);
    // Buscar el usuario recién creado para loguear su estado de verificación
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    console.log('[REGISTER] Usuario creado:', user?.email, 'isEmailVerified:', user?.isEmailVerified);
    return res;
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
    console.log('[LOGIN] Intento de login:', dto.email);
    // Extraer IP y user-agent del request
    let ip = req.ip;
    const xff = req.headers['x-forwarded-for'];
    if (Array.isArray(xff)) ip = xff[0];
    else if (typeof xff === 'string') ip = xff;

    let userAgent: string | undefined = undefined;
    const ua = req.headers['user-agent'];
    if (Array.isArray(ua)) userAgent = ua[0];
    else if (typeof ua === 'string') userAgent = ua;

    try {
      const result = await this.usersService.login({ ...dto, ip, userAgent, res });
      console.log('[LOGIN] Login exitoso para:', dto.email);
      return res.json(result);
    } catch (err: any) {
      let errorMsg = '';
      if (err && typeof err === 'object') {
        if ('response' in err && err.response && 'data' in err.response) {
          errorMsg = JSON.stringify(err.response.data);
        } else if ('message' in err) {
          errorMsg = err.message;
        } else {
          errorMsg = JSON.stringify(err);
        }
      } else {
        errorMsg = String(err);
      }
      console.error('[LOGIN] Error login para:', dto.email, '\n', errorMsg);
      throw err;
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: RequestWithUser, @Body() dto: { newPassword: string }) {
    if (!req.user) throw new Error('No user in request');
    return this.usersService.changePassword(req.user.sub, dto.newPassword);
  }

  @Post('resend-verification')
  async resendVerification(@Body() dto: ForgotPasswordDto) {
    console.log('POST /users/resend-verification recibido. Email:', dto.email);
    // Buscar usuario y reenviar email de verificación si no está verificado
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
    console.log('Usuario encontrado:', user ? user.email : null, 'isEmailVerified:', user ? user.isEmailVerified : null);
    if (!user) {
      console.log('No se encontró el usuario');
      return { success: false, message: 'Usuario no encontrado.' };
    }
    if (user.isEmailVerified) {
      console.log('El email ya está verificado');
      return { success: false, message: 'El email ya está verificado.' };
    }
    // Generar nuevo token y reenviar
    const verificationToken = user.verificationToken || require('uuid').v4();
    const verificationTokenExpires = user.verificationTokenExpires || new Date(Date.now() + 1000 * 60 * 60 * 24);
    console.log('Token generado/enviado:', verificationToken, 'Expira:', verificationTokenExpires);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationTokenExpires },
    });
    await this.usersService['emailService'].sendVerificationEmail(user.email, verificationToken);
    console.log('Email de verificación enviado a:', user.email);
    return { success: true, message: 'Correo de verificación reenviado.' };
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
      console.log('[BACK] /users/refresh - refresh_token recibido:', refreshToken);
      if (!refreshToken) {
        console.warn('[BACK] /users/refresh - No refresh token en cookies');
        return res.status(401).json({ message: 'No refresh token' });
      }
      try {
        const result = await this.usersService.refreshAccessToken(refreshToken, req, res);
        // Setear la cookie access_token igual que en login
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', result.accessToken, {
          httpOnly: true,
          secure: isProd ? true : false,
          sameSite: isProd ? 'strict' : 'lax',
          maxAge: 15 * 60 * 1000, // 15 minutos
          path: '/',
        });
        return res.json(result);
      } catch (err: any) {
        console.error('[BACK] /users/refresh - Error:', err);
        const errorMsg = typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err);
        return res.status(401).json({ message: 'Refresh token inválido o expirado', error: errorMsg });
      }
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