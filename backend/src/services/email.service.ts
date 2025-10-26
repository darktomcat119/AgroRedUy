import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

/**
 * @fileoverview Email Service - Handles all email operations
 * @description This service manages email sending for verification, notifications, and other communications
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * @description Send email verification
   * @param email User email address
   * @param firstName User first name
   * @param token Verification token
   */
  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verificación de Email - AgroRedUy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            background: #2d5016; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 AgroRedUy</h1>
            <p>Verificación de Email</p>
          </div>
          <div class="content">
            <h2>¡Hola ${firstName}!</h2>
            <p>Gracias por registrarte en AgroRedUy. Para completar tu registro, necesitas verificar tu dirección de email.</p>
            <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
            <a href="${verificationUrl}" class="button">Verificar Email</a>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;">${verificationUrl}</p>
            <p><strong>Este enlace expirará en 24 horas.</strong></p>
            <p>Si no creaste una cuenta en AgroRedUy, puedes ignorar este email.</p>
          </div>
          <div class="footer">
            <p>© 2024 AgroRedUy - Plataforma de Servicios Agrícolas</p>
            <p>Este es un email automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ¡Hola ${firstName}!
      
      Gracias por registrarte en AgroRedUy. Para completar tu registro, necesitas verificar tu dirección de email.
      
      Visita este enlace para verificar tu cuenta:
      ${verificationUrl}
      
      Este enlace expirará en 24 horas.
      
      Si no creaste una cuenta en AgroRedUy, puedes ignorar este email.
      
      © 2024 AgroRedUy - Plataforma de Servicios Agrícolas
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verifica tu email - AgroRedUy',
      html,
      text
    });
  }

  /**
   * @description Send password reset email
   * @param email User email address
   * @param firstName User first name
   * @param token Reset token
   */
  async sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Restablecer Contraseña - AgroRedUy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            background: #2d5016; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 AgroRedUy</h1>
            <p>Restablecer Contraseña</p>
          </div>
          <div class="content">
            <h2>¡Hola ${firstName}!</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en AgroRedUy.</p>
            <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;">${resetUrl}</p>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email.</p>
          </div>
          <div class="footer">
            <p>© 2024 AgroRedUy - Plataforma de Servicios Agrícolas</p>
            <p>Este es un email automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ¡Hola ${firstName}!
      
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en AgroRedUy.
      
      Visita este enlace para crear una nueva contraseña:
      ${resetUrl}
      
      Este enlace expirará en 1 hora.
      
      Si no solicitaste restablecer tu contraseña, puedes ignorar este email.
      
      © 2024 AgroRedUy - Plataforma de Servicios Agrícolas
    `;

    await this.sendEmail({
      to: email,
      subject: 'Restablecer contraseña - AgroRedUy',
      html,
      text
    });
  }

  /**
   * @description Send welcome email
   * @param email User email address
   * @param firstName User first name
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>¡Bienvenido a AgroRedUy!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 AgroRedUy</h1>
            <p>¡Bienvenido!</p>
          </div>
          <div class="content">
            <h2>¡Hola ${firstName}!</h2>
            <p>¡Bienvenido a AgroRedUy! Tu cuenta ha sido verificada exitosamente.</p>
            <p>Ahora puedes:</p>
            <ul>
              <li>Explorar servicios agrícolas</li>
              <li>Publicar tus propios servicios</li>
              <li>Conectar con otros profesionales del sector</li>
              <li>Acceder a herramientas especializadas</li>
            </ul>
            <p>¡Esperamos que disfrutes de nuestra plataforma!</p>
          </div>
          <div class="footer">
            <p>© 2024 AgroRedUy - Plataforma de Servicios Agrícolas</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ¡Hola ${firstName}!
      
      ¡Bienvenido a AgroRedUy! Tu cuenta ha sido verificada exitosamente.
      
      Ahora puedes:
      - Explorar servicios agrícolas
      - Publicar tus propios servicios
      - Conectar con otros profesionales del sector
      - Acceder a herramientas especializadas
      
      ¡Esperamos que disfrutes de nuestra plataforma!
      
      © 2024 AgroRedUy - Plataforma de Servicios Agrícolas
    `;

    await this.sendEmail({
      to: email,
      subject: '¡Bienvenido a AgroRedUy!',
      html,
      text
    });
  }

  /**
   * @description Send generic email
   * @param options Email options
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"AgroRedUy" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}: ${info.messageId}`);
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * @description Send booking confirmation email
   * @param booking Booking data
   * @param service Service data
   * @param user User data
   */
  async sendBookingConfirmationEmail(booking: any, service: any, user: any): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Reserva - AgroRedUy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 AgroRedUy</h1>
            <p>Confirmación de Reserva</p>
          </div>
          <div class="content">
            <h2>¡Hola ${user.firstName}!</h2>
            <p>Tu reserva ha sido confirmada exitosamente.</p>
            <div class="booking-details">
              <h3>Detalles de la Reserva:</h3>
              <p><strong>Servicio:</strong> ${service.title}</p>
              <p><strong>Proveedor:</strong> ${service.user.firstName} ${service.user.lastName}</p>
              <p><strong>Fecha:</strong> ${new Date(booking.availability.date).toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> ${booking.availability.startTime} - ${booking.availability.endTime}</p>
              <p><strong>Duración:</strong> ${booking.durationHours} horas</p>
              <p><strong>Precio Total:</strong> $${booking.totalPrice}</p>
              <p><strong>Contacto:</strong> ${booking.contactName} (${booking.contactEmail})</p>
              ${booking.notes ? `<p><strong>Notas:</strong> ${booking.notes}</p>` : ''}
            </div>
            <p>¡Gracias por usar AgroRedUy!</p>
          </div>
          <div class="footer">
            <p>© 2024 AgroRedUy - Plataforma de Servicios Agrícolas</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ¡Hola ${user.firstName}!
      
      Tu reserva ha sido confirmada exitosamente.
      
      Detalles de la Reserva:
      - Servicio: ${service.title}
      - Proveedor: ${service.user.firstName} ${service.user.lastName}
      - Fecha: ${new Date(booking.availability.date).toLocaleDateString('es-ES')}
      - Hora: ${booking.availability.startTime} - ${booking.availability.endTime}
      - Duración: ${booking.durationHours} horas
      - Precio Total: $${booking.totalPrice}
      - Contacto: ${booking.contactName} (${booking.contactEmail})
      ${booking.notes ? `- Notas: ${booking.notes}` : ''}
      
      ¡Gracias por usar AgroRedUy!
      
      © 2024 AgroRedUy - Plataforma de Servicios Agrícolas
    `;

    await this.sendEmail({
      to: booking.contactEmail,
      subject: 'Confirmación de Reserva - AgroRedUy',
      html,
      text
    });
  }

  /**
   * @description Send booking status update email
   * @param booking Booking data
   * @param service Service data
   * @param user User data
   * @param status New status
   */
  async sendBookingStatusUpdateEmail(booking: any, service: any, user: any, status: string): Promise<void> {
    const statusMessages = {
      'CONFIRMED': 'confirmada',
      'CANCELLED': 'cancelada',
      'COMPLETED': 'completada'
    };

    const statusMessage = statusMessages[status as keyof typeof statusMessages] || 'actualizada';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Actualización de Reserva - AgroRedUy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .status { background: ${status === 'CANCELLED' ? '#ffebee' : '#e8f5e8'}; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 AgroRedUy</h1>
            <p>Actualización de Reserva</p>
          </div>
          <div class="content">
            <h2>¡Hola ${user.firstName}!</h2>
            <div class="status">
              <h3>Tu reserva ha sido ${statusMessage}</h3>
            </div>
            <p><strong>Servicio:</strong> ${service.title}</p>
            <p><strong>Fecha:</strong> ${new Date(booking.availability.date).toLocaleDateString('es-ES')}</p>
            <p><strong>Hora:</strong> ${booking.availability.startTime} - ${booking.availability.endTime}</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          </div>
          <div class="footer">
            <p>© 2024 AgroRedUy - Plataforma de Servicios Agrícolas</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ¡Hola ${user.firstName}!
      
      Tu reserva ha sido ${statusMessage}.
      
      Servicio: ${service.title}
      Fecha: ${new Date(booking.availability.date).toLocaleDateString('es-ES')}
      Hora: ${booking.availability.startTime} - ${booking.availability.endTime}
      
      Si tienes alguna pregunta, no dudes en contactarnos.
      
      © 2024 AgroRedUy - Plataforma de Servicios Agrícolas
    `;

    await this.sendEmail({
      to: booking.contactEmail,
      subject: `Reserva ${statusMessage} - AgroRedUy`,
      html,
      text
    });
  }

  /**
   * @description Send service review reminder email
   * @param booking Booking data
   * @param service Service data
   * @param user User data
   */
  async sendReviewReminderEmail(booking: any, service: any, user: any): Promise<void> {
    const reviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/review/${booking.id}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Califica tu Experiencia - AgroRedUy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            background: #2d5016; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 AgroRedUy</h1>
            <p>Califica tu Experiencia</p>
          </div>
          <div class="content">
            <h2>¡Hola ${user.firstName}!</h2>
            <p>Esperamos que hayas tenido una excelente experiencia con el servicio:</p>
            <p><strong>${service.title}</strong></p>
            <p>Tu opinión es muy importante para nosotros y para otros usuarios. Por favor, tómate un momento para calificar tu experiencia:</p>
            <a href="${reviewUrl}" class="button">Calificar Servicio</a>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;">${reviewUrl}</p>
            <p>¡Gracias por usar AgroRedUy!</p>
          </div>
          <div class="footer">
            <p>© 2024 AgroRedUy - Plataforma de Servicios Agrícolas</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ¡Hola ${user.firstName}!
      
      Esperamos que hayas tenido una excelente experiencia con el servicio: ${service.title}
      
      Tu opinión es muy importante para nosotros y para otros usuarios. Por favor, tómate un momento para calificar tu experiencia:
      
      ${reviewUrl}
      
      ¡Gracias por usar AgroRedUy!
      
      © 2024 AgroRedUy - Plataforma de Servicios Agrícolas
    `;

    await this.sendEmail({
      to: booking.contactEmail,
      subject: 'Califica tu Experiencia - AgroRedUy',
      html,
      text
    });
  }

  /**
   * @description Send service provider notification email
   * @param booking Booking data
   * @param service Service data
   * @param provider Provider data
   */
  async sendProviderNotificationEmail(booking: any, service: any, provider: any): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nueva Reserva - AgroRedUy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 AgroRedUy</h1>
            <p>Nueva Reserva</p>
          </div>
          <div class="content">
            <h2>¡Hola ${provider.firstName}!</h2>
            <p>Has recibido una nueva reserva para tu servicio.</p>
            <div class="booking-details">
              <h3>Detalles de la Reserva:</h3>
              <p><strong>Servicio:</strong> ${service.title}</p>
              <p><strong>Cliente:</strong> ${booking.contactName}</p>
              <p><strong>Email:</strong> ${booking.contactEmail}</p>
              <p><strong>Teléfono:</strong> ${booking.contactPhone}</p>
              <p><strong>Fecha:</strong> ${new Date(booking.availability.date).toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> ${booking.availability.startTime} - ${booking.availability.endTime}</p>
              <p><strong>Duración:</strong> ${booking.durationHours} horas</p>
              <p><strong>Precio Total:</strong> $${booking.totalPrice}</p>
              ${booking.notes ? `<p><strong>Notas del Cliente:</strong> ${booking.notes}</p>` : ''}
            </div>
            <p>Por favor, confirma o cancela esta reserva desde tu panel de control.</p>
          </div>
          <div class="footer">
            <p>© 2024 AgroRedUy - Plataforma de Servicios Agrícolas</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ¡Hola ${provider.firstName}!
      
      Has recibido una nueva reserva para tu servicio.
      
      Detalles de la Reserva:
      - Servicio: ${service.title}
      - Cliente: ${booking.contactName}
      - Email: ${booking.contactEmail}
      - Teléfono: ${booking.contactPhone}
      - Fecha: ${new Date(booking.availability.date).toLocaleDateString('es-ES')}
      - Hora: ${booking.availability.startTime} - ${booking.availability.endTime}
      - Duración: ${booking.durationHours} horas
      - Precio Total: $${booking.totalPrice}
      ${booking.notes ? `- Notas del Cliente: ${booking.notes}` : ''}
      
      Por favor, confirma o cancela esta reserva desde tu panel de control.
      
      © 2024 AgroRedUy - Plataforma de Servicios Agrícolas
    `;

    await this.sendEmail({
      to: provider.email,
      subject: 'Nueva Reserva - AgroRedUy',
      html,
      text
    });
  }

  /**
   * @description Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}
