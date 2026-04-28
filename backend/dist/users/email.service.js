"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let EmailService = class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendVerificationEmail(to, token) {
        const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}?email=${encodeURIComponent(to)}`;
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || 'no-reply@two-bros-brew.com',
                to,
                subject: 'Verifica tu email',
                html: `<p>Haz clic en el siguiente botón para verificar tu email:</p>
         <p><a href="${url}" style="display:inline-block;padding:8px 28px;background:#b7791f;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Verificar email</a></p>`
            });
        }
        catch (err) {
            throw err;
        }
    }
    async sendAccountLockedEmail(to, token) {
        const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/unlock-account/${token}?email=${encodeURIComponent(to)}`;
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || 'no-reply@two-bros-brew.com',
                to,
                subject: 'Cuenta bloqueada temporalmente',
                html: `<p>Tu cuenta ha sido bloqueada por múltiples intentos fallidos de acceso.<br>Para desbloquearla puedes esperar 30 minutos o hacer clic en el siguiente botón para recuperar acceso inmediato:</p>
            <p><a href="${url}" style="display:inline-block;padding:8px 28px;background:#b7791f;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Recuperar acceso a cuenta</a></p>`
            });
        }
        catch (err) {
            throw err;
        }
    }
    async sendResetPasswordEmail(to, token) {
        const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || 'no-reply@two-bros-brew.com',
                to,
                subject: 'Recupera tu contraseña',
                html: `<p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
          <p><a href="${url}" style="display:inline-block;padding:8px 28px;background:#b7791f;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Restablecer contraseña</a></p>`
            });
        }
        catch (err) {
            throw new Error('No se pudo enviar el email de recuperación de contraseña.');
        }
    }
};
EmailService = __decorate([
    (0, common_1.Injectable)()
], EmailService);
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map