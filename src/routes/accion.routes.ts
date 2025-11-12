import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { crearAccionSchema, actualizarEstadoAccionSchema } from '../schemas/accion.schema';
import { AccionController } from '../controllers/accion.controller';

const router = Router();
const controller = new AccionController();

router.post('/', authenticate, validate(crearAccionSchema), (req, res) => controller.crear(req, res));
router.get('/plan/:planId', authenticate, (req, res) => controller.listarPorPlan(req, res));
router.patch('/:id/estado', authenticate, validate(actualizarEstadoAccionSchema), (req, res) => controller.actualizarEstado(req, res));

export default router;
