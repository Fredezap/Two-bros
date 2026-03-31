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
      // Buscar usuario por token, aunque ya esté verificado
      const user = await this.prisma.user.findFirst({
        where: {
          verificationToken: token,
        },
      });
      console.log('[VERIFY EMAIL] Token recibido:', token);
      console.log('[VERIFY EMAIL] Usuario encontrado:', user?.email, 'isEmailVerified:', user?.isEmailVerified, 'verificationTokenExpires:', user?.verificationTokenExpires);
      if (!user) throw new BadRequestException('Token inválido o expirado');
      if (user.isEmailVerified) {
        return { message: 'El email ya está verificado.' };
      }
      if (!user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
        // Si el token expiró, pero el email ya está verificado, mostrar mensaje adecuado
        if (user.isEmailVerified) {
          return { message: 'El email ya está verificado.' };
        }
        console.log('[VERIFY EMAIL] Token expirado. Fecha expiración:', user.verificationTokenExpires, 'Ahora:', new Date());
        throw new BadRequestException('Token inválido o expirado');
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });
      console.log('[VERIFY EMAIL] Email verificado correctamente para:', user.email);
      return { message: 'Email verificado correctamente.' };
    }

  // ...existing code...
  async login(dto: { email: string; password: string; deviceId: string; deviceName?: string; ip?: string; userAgent?: string, res?: any }) {

    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new BadRequestException({ message: 'Usuario no encontrado.', code: 'USER_NOT_FOUND' });
    }
    if (!user.isEmailVerified) {
      throw new BadRequestException({ message: 'Debes verificar tu email antes de iniciar sesión.', code: 'EMAIL_NOT_VERIFIED' });
    }
    if (user.lockUntil && user.lockUntil > new Date()) {
      // Si la cuenta sigue bloqueada, mostrar mensaje con hora exacta
      const unlockDate = new Date(user.lockUntil);
      const now = new Date();
      console.log('Cuenta bloqueada hasta:', unlockDate);
      console.log('Hora actual:', now);
      if (unlockDate > now) {
        // Formatear hora HH:mm:ss
        const unlockTime = unlockDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        throw new BadRequestException({
          message: `Tu cuenta está bloqueada por 30 minutos. Puedes esperar hasta ${unlockTime} o usar el enlace de recuperación enviado a tu email.`,
          code: 'ACCOUNT_LOCKED',
          unlockAt: user.lockUntil
        });
      }
      // Si ya pasó el tiempo, limpiar bloqueo y continuar login normalmente
      await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockUntil: null } });
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      const prevFailed = user.failedLoginAttempts || 0;
      const failedLoginAttempts = prevFailed + 1;
      let lockUntil = user.lockUntil;
      let sendLockEmail = false;
      let unlockToken = user.verificationToken;
      let unlockTokenExpires = user.verificationTokenExpires;
      let remainingAttempts = 5 - failedLoginAttempts;
      // Bloquear exactamente al 5to intento
      if (failedLoginAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        sendLockEmail = true;
        unlockToken = uuidv4();
        unlockTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
        remainingAttempts = 0;
      }
      await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts, lockUntil, verificationToken: unlockToken, verificationTokenExpires: unlockTokenExpires } });
      await this.prisma.loginAttempt.create({
        data: { userId: user.id, email: user.email, ip: dto.ip, userAgent: dto.userAgent, deviceId: dto.deviceId, success: false },
      });
      if (sendLockEmail && unlockToken) await this.emailService.sendAccountLockedEmail(user.email, unlockToken);
      if (failedLoginAttempts >= 5) {
        // Lanzar error de cuenta bloqueada
        const unlockTime = lockUntil ? lockUntil.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        throw new BadRequestException({
          message: `Por razones de seguridad, después de varios intentos fallidos tu cuenta se bloqueó por 30 minutos. Puedes esperar hasta ${unlockTime} o usar el enlace de recuperación enviado a tu email.`,
          code: 'ACCOUNT_LOCKED',
          unlockAt: lockUntil
        });
      } else {
        throw new BadRequestException({
          message: 'Contraseña incorrecta',
          remainingAttempts,
          locked: false
        });
      }
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
        type: 'REFRESH_TOKEN',
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
    return response;
  }

    async forgotPassword(email: string) {
    console.log('[forgotPassword] Solicitud recibida para:', email);
      const normalizedEmail = email.trim().toLowerCase();
      const user = await this.prisma.user.findFirst({
        where: { email: normalizedEmail },
      });
    console.log("usuario encontrado:", user);
    if (!user) {
        console.log('[forgotPassword] Usuario NO encontrado:', normalizedEmail);
      return { success: false, message: 'Usuario no encontrado.' };
    }
    console.log('[forgotPassword] Usuario encontrado, enviando email:', user.email);
    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: resetToken, verificationTokenExpires: resetTokenExpires },
    });
    try {
      await this.emailService.sendResetPasswordEmail(user.email, resetToken);
      return { success: true, message: 'Si el email existe, se enviará un enlace para restablecer la contraseña.' };
    } catch (error) {
      console.error('Error enviando email de recuperación de contraseña:', error);
      return { success: false, message: 'No se pudo enviar el email de recuperación de contraseña.' };
    }
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
    console.log('[BACK] refreshAccessToken - token recibido:', refreshToken);
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
    if (!found) {
      console.warn('[BACK] refreshAccessToken - Token no encontrado en DB');
      throw new BadRequestException('Refresh token inválido');
    }
    if (found.expiresAt < new Date()) {
      console.warn('[BACK] refreshAccessToken - Token expirado en DB:', found.expiresAt, 'ahora:', new Date());
      throw new BadRequestException('Refresh token expirado');
    }

    // Verificar JWT
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (e) {
      console.warn('[BACK] refreshAccessToken - JWT inválido:', e);
      throw new BadRequestException('Refresh token inválido');
    }

    // Emitir nuevo access token
    const accessToken = this.jwtService.sign({ sub: payload.sub, email: payload.email }, '15m');
    console.log('[BACK] refreshAccessToken - Nuevo access_token emitido para:', payload.email);
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