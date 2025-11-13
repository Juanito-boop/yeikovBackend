import { Response } from 'express';
import { DecanoService } from '../services/decano.service';
import { AuthRequest } from '../middleware/auth.middleware';

const decanoService = new DecanoService();

export class DecanoController {
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const stats = await decanoService.getDecanoStats(req.user.userId);
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getReportes(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const reportes = await decanoService.getReportesDecano(req.user.userId);
      res.status(200).json(reportes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDepartamentos(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const departamentos = await decanoService.getDepartamentos(req.user.userId);
      res.status(200).json({ departamentos });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
