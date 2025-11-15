import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  async obtenerAlertas(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const alertas = await dashboardService.obtenerAlertas();
      res.status(200).json(alertas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerEstadisticasGenerales(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const estadisticas = await dashboardService.obtenerEstadisticasGenerales();
      res.status(200).json(estadisticas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerEstadisticasPorDepartamento(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const departamentos = await dashboardService.obtenerEstadisticasPorDepartamento();
      res.status(200).json(departamentos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
