import { Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth.middleware';

const notificationService = new NotificationService();

export class NotificationController {
  async getMyNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const notifications = await notificationService.getByUserId(req.user.userId, limit);

      res.status(200).json({
        notifications
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id);

      res.status(200).json({
        message: 'Notificación marcada como leída'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      await notificationService.markAllAsRead(req.user.userId);

      res.status(200).json({
        message: 'Todas las notificaciones marcadas como leídas'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
