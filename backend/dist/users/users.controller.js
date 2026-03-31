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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcryptjs");
const register_user_dto_1 = require("./dto/register-user.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
const login_user_dto_1 = require("./dto/login-user.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const users_service_1 = require("./users.service");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let UsersController = class UsersController {
    constructor(usersService, prisma) {
        this.usersService = usersService;
        this.prisma = prisma;
    }
    async verifyEmailToken(dto) {
        const tokenRecord = await this.prisma.refreshToken.findFirst({
            where: {
                tokenHash: dto.token,
                type: 'VERIFY_EMAIL',
                expiresAt: { gt: new Date() },
            },
        });
        if (!tokenRecord)
            throw new Error('Token inválido o expirado');
        const user = await this.prisma.user.findUnique({ where: { id: tokenRecord.userId } });
        if (!user)
            throw new Error('Usuario no encontrado');
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
    async sendUnlockEmail(dto) {
        console.log('POST /users/send-unlock-email recibido. Email:', dto.email);
        const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
        console.log('Usuario encontrado:', user ? user.email : null);
        if (!user) {
            console.log('No se encontró el usuario');
            return { success: false, message: 'Usuario no encontrado.' };
        }
        if (!user.lockUntil || user.lockUntil < new Date()) {
            console.log('La cuenta no está bloqueada actualmente. No es necesario desbloquear. lockUntil:', user.lockUntil, 'now:', new Date());
            return { success: false, message: 'La cuenta ya no está bloqueada. Intenta iniciar sesión normalmente.' };
        }
        const unlockToken = require('uuid').v4();
        const unlockTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
        console.log('Token generado/enviado:', unlockToken, 'Expira:', unlockTokenExpires);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: unlockToken, verificationTokenExpires: unlockTokenExpires },
        });
        console.log('Antes de enviar email de desbloqueo...');
        try {
            await this.usersService['emailService'].sendAccountLockedEmail(user.email, unlockToken);
            console.log('Email de desbloqueo enviado a:', user.email);
        }
        catch (err) {
            console.error('Error enviando email de desbloqueo:', err);
            return { success: false, message: 'Error enviando email de desbloqueo.' };
        }
        return { success: true, message: 'Correo de desbloqueo reenviado.' };
    }
    async resetPasswordToken(dto) {
        const tokenRecord = await this.prisma.refreshToken.findFirst({
            where: {
                tokenHash: dto.token,
                type: 'RESET_PASSWORD',
                expiresAt: { gt: new Date() },
            },
        });
        if (!tokenRecord)
            throw new Error('Token inválido o expirado');
        const user = await this.prisma.user.findUnique({ where: { id: tokenRecord.userId } });
        if (!user)
            throw new Error('Usuario no encontrado');
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: tokenRecord.userId },
            data: { passwordHash },
        });
        await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
        return { message: 'Contraseña restablecida correctamente.' };
    }
    async register(dto) {
        const res = await this.usersService.register(dto);
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        console.log('[REGISTER] Usuario creado:', user === null || user === void 0 ? void 0 : user.email, 'isEmailVerified:', user === null || user === void 0 ? void 0 : user.isEmailVerified);
        return res;
    }
    async verifyEmail(dto) {
        return this.usersService.verifyEmail(dto.token);
    }
    async forgotPassword(dto) {
        return this.usersService.forgotPassword(dto.email);
    }
    async resetPassword(dto) {
        return this.usersService.resetPassword(dto.token, dto.newPassword);
    }
    async login(dto, req, res) {
        console.log('[LOGIN] Intento de login:', dto.email);
        let ip = req.ip;
        const xff = req.headers['x-forwarded-for'];
        if (Array.isArray(xff))
            ip = xff[0];
        else if (typeof xff === 'string')
            ip = xff;
        let userAgent = undefined;
        const ua = req.headers['user-agent'];
        if (Array.isArray(ua))
            userAgent = ua[0];
        else if (typeof ua === 'string')
            userAgent = ua;
        try {
            const result = await this.usersService.login(Object.assign(Object.assign({}, dto), { ip, userAgent, res }));
            console.log('[LOGIN] Login exitoso para:', dto.email);
            return res.json(result);
        }
        catch (err) {
            let errorMsg = '';
            if (err && typeof err === 'object') {
                if ('response' in err && err.response && 'data' in err.response) {
                    errorMsg = JSON.stringify(err.response.data);
                }
                else if ('message' in err) {
                    errorMsg = err.message;
                }
                else {
                    errorMsg = JSON.stringify(err);
                }
            }
            else {
                errorMsg = String(err);
            }
            console.error('[LOGIN] Error login para:', dto.email, '\n', errorMsg);
            throw err;
        }
    }
    async changePassword(req, dto) {
        if (!req.user)
            throw new Error('No user in request');
        return this.usersService.changePassword(req.user.sub, dto.newPassword);
    }
    async resendVerification(dto) {
        console.log('POST /users/resend-verification recibido. Email:', dto.email);
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
    async me(req) {
        if (!req.user)
            throw new Error('No user in request');
        return req.user;
    }
    async refresh(req, res) {
        var _a;
        const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refresh_token;
        console.log('[BACK] /users/refresh - refresh_token recibido:', refreshToken);
        if (!refreshToken) {
            console.warn('[BACK] /users/refresh - No refresh token en cookies');
            return res.status(401).json({ message: 'No refresh token' });
        }
        try {
            const result = await this.usersService.refreshAccessToken(refreshToken, req, res);
            const isProd = process.env.NODE_ENV === 'production';
            res.cookie('access_token', result.accessToken, {
                httpOnly: true,
                secure: isProd ? true : false,
                sameSite: isProd ? 'strict' : 'lax',
                maxAge: 15 * 60 * 1000,
                path: '/',
            });
            return res.json(result);
        }
        catch (err) {
            console.error('[BACK] /users/refresh - Error:', err);
            const errorMsg = typeof err === 'object' && err !== null && 'message' in err ? err.message : String(err);
            return res.status(401).json({ message: 'Refresh token inválido o expirado', error: errorMsg });
        }
    }
    async logout(req, res) {
        var _a;
        const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refresh_token;
        if (refreshToken)
            await this.usersService.logout(refreshToken);
        res.clearCookie('refresh_token', { path: '/' });
        return res.json({ message: 'Logout exitoso' });
    }
    async unlockAccount(token) {
        return this.usersService.unlockAccountByToken(token);
    }
};
__decorate([
    (0, common_1.Post)('verify-email-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "verifyEmailToken", null);
__decorate([
    (0, common_1.Post)('send-unlock-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "sendUnlockEmail", null);
__decorate([
    (0, common_1.Post)('reset-password-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetPasswordToken", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_user_dto_1.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_user_dto_1.LoginUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('unlock-account'),
    __param(0, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "unlockAccount", null);
UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map