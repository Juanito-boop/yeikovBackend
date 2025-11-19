import { Request, Response } from 'express';
import { PlanService } from '../services/plan.service';
import { AuthRequest } from '../middleware/auth.middleware';

const planService = new PlanService();

export class PlanController {
  async crear(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { titulo, descripcion, docenteId, incidenciaId } = req.body;
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const plan = await planService.crearPlan({
        titulo,
        descripcion,
        docenteId,
        directorId: req.user.userId,
        incidenciaId
      });
      res.status(201).json({ message: 'Plan de mejora creado y enviado al decano', plan });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listar(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const planes = await planService.listarPlanes();
      res.status(200).json({ planes });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async listarMisPlanes(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const planes = await planService.listarPlanesPorDocente(req.user.userId);
      res.status(200).json({ planes });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtener(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const plan = await planService.obtenerPorId(id);
      if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
        return;
      }
      res.status(200).json({ plan });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async aprobar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { aprobado, comentarios } = req.body;
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      await planService.aprobarPlan(id, req.user.userId, aprobado, comentarios);
      res.status(200).json({ message: 'Aprobación registrada' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cerrar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const plan = await planService.cerrarPlan(id);
      res.status(200).json({ message: 'Plan cerrado', plan });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async actualizar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { titulo, descripcion, incidenciaId } = req.body;

      const plan = await planService.actualizarPlan(id, {
        titulo,
        descripcion,
        incidenciaId
      });

      res.status(200).json({ message: 'Plan actualizado exitosamente', plan });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async reenviarADecano(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const plan = await planService.reenviarPlanADecano(id, req.user.userId);
      res.status(200).json({ message: 'Plan reenviado al decano para revisión', plan });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listarPlanesRechazados(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const planes = await planService.listarPlanesRechazadosPorDirector(req.user.userId);
      res.status(200).json({ planes });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
