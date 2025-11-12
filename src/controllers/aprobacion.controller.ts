import { Request, Response } from 'express';
import { AprobacionService } from '../services/aprobacion.service';
import { AuthRequest } from '../middleware/auth.middleware';

const aprobacionService = new AprobacionService();

export class AprobacionController {
  async listarPorPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const aprobaciones = await aprobacionService.obtenerPorPlan(planId);
      res.status(200).json({ aprobaciones });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async eliminar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await aprobacionService.eliminar(id);
      res.status(200).json({ message: 'Aprobación eliminada' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
