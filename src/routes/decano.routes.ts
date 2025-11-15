import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { DecanoController } from '../controllers/decano.controller';

const router = Router();
const controller = new DecanoController();

router.get('/stats', authenticate, (req, res) => controller.getStats(req, res));
router.get('/reportes', authenticate, (req, res) => controller.getReportes(req, res));
router.get('/departamentos', authenticate, (req, res) => controller.getDepartamentos(req, res));
router.get('/planes-pendientes', authenticate, (req, res) => controller.listarPlanesPendientes(req, res));
router.post('/planes/:id/aprobar', authenticate, (req, res) => controller.aprobarPlan(req, res));

export default router;
