import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { listarLogs, obtenerEstadisticas, obtenerActividadReciente } from '../controllers/audit.controller';

const router = Router();

// Solo administradores y directores pueden ver logs de auditoría
router.get('/logs', authenticate, authorize(['Administrador', 'Director']), listarLogs);

// Estadísticas de auditoría
router.get('/estadisticas', authenticate, authorize(['Administrador', 'Director']), obtenerEstadisticas);

// Actividad reciente para dashboard
router.get('/actividad-reciente', authenticate, obtenerActividadReciente);

export default router;
