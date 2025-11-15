import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
const controller = new DashboardController();

// Obtener alertas del sistema (solo admin y directores)
router.get('/alertas', authenticate, authorize(['Administrador', 'Director']), (req, res) =>
  controller.obtenerAlertas(req, res)
);

// Obtener estadísticas generales
router.get('/estadisticas', authenticate, authorize(['Administrador', 'Director']), (req, res) =>
  controller.obtenerEstadisticasGenerales(req, res)
);

// Obtener estadísticas por departamento
router.get('/departamentos', authenticate, authorize(['Administrador', 'Director']), (req, res) =>
  controller.obtenerEstadisticasPorDepartamento(req, res)
);

export default router;
