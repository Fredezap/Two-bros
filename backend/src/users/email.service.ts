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
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}?email=${encodeURIComponent(to)}`;
    try {
      console.log('[sendVerificationEmail] Intentando enviar email a:', to, 'con token:', token, 'url:', url);
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@two-bros-brew.com',
        to,
        subject: 'Verifica tu email',
        html: `<p>Haz clic en el siguiente botón para verificar tu email:</p>
         <p><a href="${url}" style="display:inline-block;padding:8px 28px;background:#b7791f;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Verificar email</a></p>`
      });
      console.log('[sendVerificationEmail] Email de verificación enviado:', info);
    } catch (err) {
      console.error('[sendVerificationEmail] Error enviando email de verificación:', err);
      throw err;
    }
  }

    async sendAccountLockedEmail(to: string, token: string) {
      const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/unlock-account/${token}?email=${encodeURIComponent(to)}`;
      try {
          console.log('[sendAccountLockedEmail] Intentando enviar email a:', to, 'con token:', token, 'url:', url);
          const info = await this.transporter.sendMail({
           from: process.env.SMTP_FROM || 'no-reply@two-bros-brew.com',
           to,
           subject: 'Cuenta bloqueada temporalmente',
           html: `<p>Tu cuenta ha sido bloqueada por múltiples intentos fallidos de acceso.<br>Para desbloquearla puedes esperar 30 minutos o hacer clic en el siguiente botón para recuperar acceso inmediato:</p>
            <p><a href="${url}" style="display:inline-block;padding:8px 28px;background:#b7791f;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Recuperar acceso a cuenta</a></p>`
          });
          console.log('[sendAccountLockedEmail] Email de cuenta bloqueada enviado:', info);
          if (info && info.accepted && info.accepted.length > 0) {
            console.log('[sendAccountLockedEmail] Email aceptado por el servidor SMTP:', info.accepted);
          } else {
            console.warn('[sendAccountLockedEmail] El servidor SMTP NO aceptó el email:', info);
          }
      } catch (err) {
          console.error('[sendAccountLockedEmail] Error enviando email de cuenta bloqueada:', err);
          throw err;
      }
    }

    async sendResetPasswordEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    console.log(process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER, process.env.SMTP_PASS, 'Enviando email de restablecimiento de contraseña a:', to);
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@two-bros-brew.com',
        to,
        subject: 'Recupera tu contraseña',
        html: `<p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
          <p><a href="${url}" style="display:inline-block;padding:8px 28px;background:#b7791f;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Restablecer contraseña</a></p>`
      });
      console.log('Email de recuperación de contraseña enviado:', info);
    } catch (err) {
      console.error('Error enviando email de recuperación de contraseña:', err);
      throw new Error('No se pudo enviar el email de recuperación de contraseña.');
    }
  }
}
