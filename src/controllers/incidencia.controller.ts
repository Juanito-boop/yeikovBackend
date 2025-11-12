import { Request, Response } from 'express';
import { IncidenciaService } from '../services/incidencia.service';
import { AuthRequest } from '../middleware/auth.middleware';

const incidenciaService = new IncidenciaService();

export class IncidenciaController {
  async crear(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { docenteId, descripcion } = req.body;
      const incidencia = await incidenciaService.crearIncidencia(docenteId, descripcion);
      res.status(201).json({ message: 'Incidencia creada', incidencia });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listar(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const incidencias = await incidenciaService.obtenerTodas();
      res.status(200).json({ incidencias });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async actualizarEstado(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const incidencia = await incidenciaService.actualizarEstado(id, estado);
      res.status(200).json({ message: 'Estado actualizado', incidencia });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
