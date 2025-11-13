import { Response } from 'express';
import { EvidenciaService } from '../services/evidencia.service';
import { AuthRequest } from '../middleware/auth.middleware';
import type { Express } from 'express';

const evidenciaService = new EvidenciaService();

export class EvidenciaController {
  async subir(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { accionId, comentario } = req.body;
      const file = req.file as Express.Multer.File;
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      if (!file) {
        res.status(400).json({ error: 'Archivo no proporcionado' });
        return;
      }
      if (!comentario || comentario.trim().length === 0) {
        res.status(400).json({ error: 'El comentario es obligatorio' });
        return;
      }

      const evidencia = await evidenciaService.subirEvidencia(accionId, file, req.user.userId, comentario);
      res.status(201).json({ message: 'Evidencia subida', evidencia });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listarPorAccion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { accionId } = req.params;
      const evidencias = await evidenciaService.obtenerPorAccion(accionId);
      res.status(200).json({ evidencias });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
