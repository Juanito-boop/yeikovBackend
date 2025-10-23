import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

router.get('/', authenticate, (req, res) => notificationController.getMyNotifications(req, res));
router.put('/:id/read', authenticate, (req, res) => notificationController.markAsRead(req, res));
router.put('/read-all', authenticate, (req, res) => notificationController.markAllAsRead(req, res));

export default router;
