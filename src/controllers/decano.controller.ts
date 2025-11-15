import { Response } from 'express';
import { DecanoService } from '../services/decano.service';
import { PlanService } from '../services/plan.service';
import { AuthRequest } from '../middleware/auth.middleware';

const decanoService = new DecanoService();
const planService = new PlanService();

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

  async listarPlanesPendientes(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const planes = await planService.listarPlanesPendientesDecano(req.user.userId);
      res.status(200).json({ planes });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async aprobarPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { id } = req.params;
      const { aprobado, comentarios } = req.body;

      if (typeof aprobado !== 'boolean') {
        res.status(400).json({ error: 'El campo "aprobado" debe ser true o false' });
        return;
      }

      const plan = await planService.aprobarPorDecano(id, req.user.userId, aprobado, comentarios);

      const mensaje = aprobado
        ? 'Plan aprobado y habilitado para el docente'
        : 'Plan rechazado y devuelto al director';

      res.status(200).json({ message: mensaje, plan });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
