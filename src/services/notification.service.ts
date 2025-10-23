import { AppDataSource } from '../database/data-source';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { NotificationInput } from '../schemas/notification.schema';
import { createEmailTransporter, emailConfig } from '../config/email.config';

export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);
  private userRepository = AppDataSource.getRepository(User);
  private emailTransporter = createEmailTransporter();

  async create(data: NotificationInput): Promise<Notification> {
    const user = await this.userRepository.findOne({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const notification = this.notificationRepository.create({
      userId: data.userId,
      tipo: data.tipo,
      mensaje: data.mensaje,
      asunto: data.asunto || 'Notificación del Sistema',
      leida: false,
      enviadoEmail: false
    });

    await this.notificationRepository.save(notification);

    if (data.enviarEmail) {
      await this.sendEmailNotification(user, notification);
      notification.enviadoEmail = true;
      await this.notificationRepository.save(notification);
    }

    return notification;
  }

  private async sendEmailNotification(user: User, notification: Notification): Promise<void> {
    try {
      const mailOptions = {
        from: emailConfig.from,
        to: user.email,
        subject: notification.asunto,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">SGPM - ${notification.asunto}</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #555; line-height: 1.6;">${notification.mensaje}</p>
            </div>
            <p style="color: #7f8c8d; font-size: 12px;">
              Esta es una notificación automática del Sistema de Gestión de Planes de Mejoramiento.
            </p>
            <p style="color: #7f8c8d; font-size: 12px;">
              Fecha: ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        `,
        text: notification.mensaje
      };

      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error al enviar email:', error);
    }
  }

  async getByUserId(userId: string, limit: number = 10): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update(notificationId, { leida: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, leida: false },
      { leida: true }
    );
  }
}
