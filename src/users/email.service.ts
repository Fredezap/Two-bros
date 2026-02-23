import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendVerificationEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@two-bros-brew.com',
      to,
      subject: 'Verifica tu email',
      html: `<p>Haz clic en el siguiente enlace para verificar tu email:</p><p><a href="${url}">Verificar email</a></p>`
    });
  }

    async sendAccountLockedEmail(to: string, token: string) {
      const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/unlock-account/${token}`;
      console.log('[EMAIL] Enviando email de cuenta bloqueada a:', to);
      try {
        const info = await this.transporter.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@two-bros-brew.com',
          to,
          subject: 'Cuenta bloqueada temporalmente',
          html: `<p>Tu cuenta ha sido bloqueada por múltiples intentos fallidos de acceso.<br>Para desbloquearla puedes esperar 30 minutos o hacer clic en el siguiente botón para recuperar acceso inmediato:</p>
            <p><a href="${url}" style="display:inline-block;padding:8px 28px;background:#b7791f;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Recuperar acceso a cuenta</a></p>`
        });
        console.log('[EMAIL] Email de cuenta bloqueada enviado:', info.messageId || info);
      } catch (err) {
        console.error('[EMAIL] Error enviando email de cuenta bloqueada:', err);
      }
    }

    async sendResetPasswordEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@two-bros-brew.com',
      to,
      subject: 'Recupera tu contraseña',
      html: `<p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
        <p><a href="${url}" style="display:inline-block;padding:8px 28px;background:#b7791f;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Restablecer contraseña</a></p>`
    });
  }
}
