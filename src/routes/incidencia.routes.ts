import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { crearIncidenciaSchema, actualizarEstadoIncidenciaSchema } from '../schemas/incidencia.schema';
import { IncidenciaController } from '../controllers/incidencia.controller';

const router = Router();
const controller = new IncidenciaController();

router.post('/', authenticate, validate(crearIncidenciaSchema), (req, res) => controller.crear(req, res));
router.get('/', authenticate, (req, res) => controller.listar(req, res));
router.patch('/:id/estado', authenticate, validate(actualizarEstadoIncidenciaSchema), (req, res) => controller.actualizarEstado(req, res));

export default router;
