import { z } from 'zod';
import { NotificationType } from '../entities/Notification';

export const notificationSchema = z.object({
  userId: z.uuid('User ID inválido'),
  tipo: z.enum(NotificationType),
  mensaje: z.string().min(1, 'El mensaje no puede estar vacío'),
  asunto: z.string().optional(),
  enviarEmail: z.boolean().default(true)
});

export type NotificationInput = z.infer<typeof notificationSchema>;
