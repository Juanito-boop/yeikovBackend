import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { DecanoController } from '../controllers/decano.controller';

const router = Router();
const controller = new DecanoController();

router.get('/stats', authenticate, (req, res) => controller.getStats(req, res));
router.get('/reportes', authenticate, (req, res) => controller.getReportes(req, res));
router.get('/departamentos', authenticate, (req, res) => controller.getDepartamentos(req, res));
router.get('/planes', authenticate, (req, res) => controller.listarPlanesFacultad(req, res)); // Todos los planes de la facultad
router.get('/planes-pendientes', authenticate, (req, res) => controller.listarPlanesPendientes(req, res));
router.get('/docentes', authenticate, (req, res) => controller.listarDocentesFacultad(req, res)); // Docentes de la facultad
router.post('/planes/:id/aprobar', authenticate, (req, res) => controller.aprobarPlan(req, res));

export default router;
