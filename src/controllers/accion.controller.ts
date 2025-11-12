import { Request, Response } from 'express';
import { AccionService } from '../services/accion.service';
import { AuthRequest } from '../middleware/auth.middleware';

const accionService = new AccionService();

export class AccionController {
  async crear(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId, descripcion, fechaObjetivo } = req.body;
      const accion = await accionService.crearAccion(planId, descripcion, fechaObjetivo);
      res.status(201).json({ message: 'Acción agregada', accion });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listarPorPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const acciones = await accionService.obtenerPorPlan(planId);
      res.status(200).json({ acciones });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async actualizarEstado(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const accion = await accionService.actualizarEstado(id, estado);
      res.status(200).json({ message: 'Estado actualizado', accion });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
