"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcryptjs");
const v4_1 = require("uuid/v4");
const email_service_1 = require("./email.service");
const jwt_service_1 = require("./jwt.service");
let UsersService = class UsersService {
    constructor(prisma, emailService, jwtService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.BadRequestException('El email ya está registrado');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const verificationToken = (0, v4_1.default)();
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                verificationToken,
                isEmailVerified: false,
                verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
        });
        await this.emailService.sendVerificationEmail(user.email, verificationToken);
        return { message: 'Usuario registrado. Revisa tu email para activar la cuenta.' };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpires: { gt: new Date() },
                isEmailVerified: false,
            },
        });
        if (!user)
            throw new common_1.BadRequestException('Token inválido o expirado');
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
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.BadRequestException('Credenciales inválidas');
        if (user.lockUntil && user.lockUntil > new Date()) {
            throw new common_1.BadRequestException('Cuenta bloqueada. Revisa tu email para recuperarla o espera a que se desbloquee.');
        }
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
                unlockToken = (0, v4_1.default)();
                unlockTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
            }
            await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts, lockUntil, verificationToken: unlockToken, verificationTokenExpires: unlockTokenExpires } });
            await this.prisma.loginAttempt.create({
                data: { userId: user.id, email: user.email, ip: dto.ip, userAgent: dto.userAgent, deviceId: dto.deviceId, success: false },
            });
            if (sendLockEmail && unlockToken)
                await this.emailService.sendAccountLockedEmail(user.email, unlockToken);
            throw new common_1.BadRequestException({
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
        const accessToken = this.jwtService.sign({ sub: user.id, email: user.email }, '15m');
        const refreshToken = this.jwtService.sign({ sub: user.id, email: user.email, deviceId: dto.deviceId }, '7d');
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
                maxAge: 15 * 60 * 1000,
                path: '/',
            });
        }
        const { passwordHash, verificationToken, verificationTokenExpires } = user, safeUser = __rest(user, ["passwordHash", "verificationToken", "verificationTokenExpires"]);
        const response = { message: 'Login exitoso', user: safeUser, accessToken };
        return response;
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            return { message: 'Si el email existe, se enviará un enlace para restablecer la contraseña.' };
        const resetToken = (0, v4_1.default)();
        const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: resetToken, verificationTokenExpires: resetTokenExpires },
        });
        await this.emailService.sendResetPasswordEmail(user.email, resetToken);
        return { message: 'Si el email existe, se enviará un enlace para restablecer la contraseña.' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpires: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException('Token inválido o expirado');
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
    async changePassword(userId, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { message: 'Contraseña cambiada correctamente.' };
    }
    async refreshAccessToken(refreshToken, req, res) {
        const dbTokens = await this.prisma.refreshToken.findMany({
            where: { revokedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        let found = null;
        for (const dbToken of dbTokens) {
            if (await bcrypt.compare(refreshToken, dbToken.tokenHash)) {
                found = dbToken;
                break;
            }
        }
        if (!found)
            throw new common_1.BadRequestException('Refresh token inválido');
        if (found.expiresAt < new Date())
            throw new common_1.BadRequestException('Refresh token expirado');
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken);
        }
        catch (_a) {
            throw new common_1.BadRequestException('Refresh token inválido');
        }
        const accessToken = this.jwtService.sign({ sub: payload.sub, email: payload.email }, '15m');
        return { accessToken };
    }
    async logout(refreshToken) {
        const dbTokens = await this.prisma.refreshToken.findMany({ where: { revokedAt: null } });
        for (const dbToken of dbTokens) {
            if (await bcrypt.compare(refreshToken, dbToken.tokenHash)) {
                await this.prisma.refreshToken.update({ where: { id: dbToken.id }, data: { revokedAt: new Date() } });
                break;
            }
        }
    }
    async unlockAccountByToken(token) {
        const user = await this.prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpires: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException('Token inválido o expirado');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockUntil: null, verificationToken: null, verificationTokenExpires: null },
        });
        return { message: 'Cuenta desbloqueada. Ahora puedes iniciar sesión.' };
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        jwt_service_1.JwtService])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map