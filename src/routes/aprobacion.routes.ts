import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { crearAprobacionSchema } from '../schemas/aprobacion.schema';
import { AprobacionController } from '../controllers/aprobacion.controller';

const router = Router();
const controller = new AprobacionController();

router.get('/plan/:planId', authenticate, (req, res) => controller.listarPorPlan(req, res));
router.delete('/:id', authenticate, (req, res) => controller.eliminar(req, res));

// opcional: endpoint para crear registros manuales de aprobación
router.post('/', authenticate, validate(crearAprobacionSchema), (req, res) => {
  // podrías implementar controller.crear si lo necesitas
  res.status(501).json({ message: 'No implementado aún' });
});

export default router;
