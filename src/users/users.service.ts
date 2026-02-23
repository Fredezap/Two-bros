import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './email.service';
import { JwtService } from './jwt.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        verificationToken,
        isEmailVerified: false,
        verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
      },
    });

    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return { message: 'Usuario registrado. Revisa tu email para activar la cuenta.' };
  }

    async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gt: new Date() },
        isEmailVerified: false,
      },
    });
    if (!user) throw new BadRequestException('Token inválido o expirado');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });
    return { message: 'Email verificado correctamente.' };
  }

  // ...existing code...
  async login(dto: { email: string; password: string; deviceId: string; deviceName?: string; ip?: string; userAgent?: string, res?: any }) {
    console.log("Login attempt:", { email: dto.email, deviceId: dto.deviceId, ip: dto.ip, userAgent: dto.userAgent });
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('Credenciales inválidas');

    // Chequeo de bloqueo
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new BadRequestException('Cuenta bloqueada. Revisa tu email para recuperarla o espera a que se desbloquee.');
    }

    // Verificar contraseña
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      const failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      let lockUntil = user.lockUntil;
      let sendLockEmail = false;
      let remainingAttempts = 5 - failedLoginAttempts;
      let unlockToken = user.verificationToken;
      let unlockTokenExpires = user.verificationTokenExpires;
      if (failedLoginAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        sendLockEmail = true;
        remainingAttempts = 0;
        unlockToken = uuidv4();
        unlockTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      }
      await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts, lockUntil, verificationToken: unlockToken, verificationTokenExpires: unlockTokenExpires } });
      await this.prisma.loginAttempt.create({
        data: { userId: user.id, email: user.email, ip: dto.ip, userAgent: dto.userAgent, deviceId: dto.deviceId, success: false },
      });
        if (sendLockEmail && unlockToken) await this.emailService.sendAccountLockedEmail(user.email, unlockToken);
      throw new BadRequestException({
        message: 'Credenciales inválidas',
        remainingAttempts,
        locked: sendLockEmail
      });
    }

    if (user.lockUntil && user.lockUntil < new Date()) {
      await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockUntil: null } });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date(), lastLoginIp: dto.ip },
    });

    await this.prisma.loginAttempt.create({
      data: { userId: user.id, email: user.email, ip: dto.ip, userAgent: dto.userAgent, deviceId: dto.deviceId, success: true },
    });

    await this.prisma.userDevice.upsert({
      where: { userId_deviceId: { userId: user.id, deviceId: dto.deviceId } },
      update: { deviceName: dto.deviceName, lastSeen: new Date(), isActive: true, ip: dto.ip },
      create: { userId: user.id, deviceId: dto.deviceId, deviceName: dto.deviceName, ip: dto.ip },
    });

    // ACCESS TOKEN (15min)
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email }, '15m');
    // REFRESH TOKEN (7d)
    const refreshToken = this.jwtService.sign({ sub: user.id, email: user.email, deviceId: dto.deviceId }, '7d');

    // Guardar hash del refresh token en DB
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: dto.userAgent,
        ip: dto.ip,
      },
    });

    // Si se pasa res, setear cookies httpOnly para refresh y access token
    if (dto.res) {
      const isProd = process.env.NODE_ENV === 'production';
      dto.res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd ? true : false,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      dto.res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProd ? true : false,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutos
        path: '/',
      });
    }

    // Preparar usuario seguro para frontend (sin passwordHash ni tokens)
    const { passwordHash, verificationToken, verificationTokenExpires, ...safeUser } = user;
    const response = { message: 'Login exitoso', user: safeUser, accessToken };
    console.log('LOGIN RESPONSE:', JSON.stringify(response, null, 2));
    return response;
  }

    async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'Si el email existe, se enviará un enlace para restablecer la contraseña.' };
    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: resetToken, verificationTokenExpires: resetTokenExpires },
    });
    await this.emailService.sendResetPasswordEmail(user.email, resetToken);
    return { message: 'Si el email existe, se enviará un enlace para restablecer la contraseña.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Token inválido o expirado');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        verificationToken: null,
        verificationTokenExpires: null,
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    });
    return { message: 'Contraseña restablecida correctamente.' };
  }

  async changePassword(userId: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: 'Contraseña cambiada correctamente.' };
  }


  async refreshAccessToken(refreshToken: string, req: any, res: any) {
    // Buscar el token en la base
    const dbTokens = await this.prisma.refreshToken.findMany({
      where: { revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    let found: any = null;
    for (const dbToken of dbTokens) {
      if (await bcrypt.compare(refreshToken, dbToken.tokenHash)) {
        found = dbToken;
        break;
      }
    }
    if (!found) throw new BadRequestException('Refresh token inválido');
    if (found.expiresAt < new Date()) throw new BadRequestException('Refresh token expirado');

    // Verificar JWT
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new BadRequestException('Refresh token inválido');
    }

    // Emitir nuevo access token
    const accessToken = this.jwtService.sign({ sub: payload.sub, email: payload.email }, '15m');
    return { accessToken };
  }

  async logout(refreshToken: string) {
    // Buscar y revocar el refresh token
    const dbTokens = await this.prisma.refreshToken.findMany({ where: { revokedAt: null } });
    for (const dbToken of dbTokens) {
      if (await bcrypt.compare(refreshToken, dbToken.tokenHash)) {
        await this.prisma.refreshToken.update({ where: { id: dbToken.id }, data: { revokedAt: new Date() } });
        break;
      }
    }
  }

  async unlockAccountByToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Token inválido o expirado');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockUntil: null, verificationToken: null, verificationTokenExpires: null },
    });
    return { message: 'Cuenta desbloqueada. Ahora puedes iniciar sesión.' };
  }
}