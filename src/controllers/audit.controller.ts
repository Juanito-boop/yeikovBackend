import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';

const auditService = new AuditService();

export const listarLogs = async (req: Request, res: Response) => {
  try {
    const {
      entidad,
      accion,
      usuarioId,
      fechaInicio,
      fechaFin,
      busqueda,
      limit = '50',
      offset = '0',
    } = req.query;

    const filtros = {
      entidad: entidad as string | undefined,
      accion: accion as string | undefined,
      usuarioId: usuarioId as string | undefined,
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
      busqueda: busqueda as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    const resultado = await auditService.listarLogs(filtros);

    res.status(200).json({
      logs: resultado.logs,
      total: resultado.total,
      limit: filtros.limit,
      offset: filtros.offset,
    });
  } catch (error: any) {
    console.error('Error al listar logs:', error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerEstadisticas = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const inicio = fechaInicio ? new Date(fechaInicio as string) : undefined;
    const fin = fechaFin ? new Date(fechaFin as string) : undefined;

    const estadisticas = await auditService.obtenerEstadisticas(inicio, fin);

    res.status(200).json(estadisticas);
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerActividadReciente = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const resultado = await auditService.listarLogs({ limit });

    res.status(200).json({
      actividades: resultado.logs.map(log => ({
        id: log.id,
        descripcion: log.descripcion,
        usuario: `${log.usuario.nombre} ${log.usuario.apellido}`,
        entidad: log.entidad,
        accion: log.accion,
        fecha: log.createdAt,
        entidadAfectada: log.entidadAfectada,
      })),
    });
  } catch (error: any) {
    console.error('Error al obtener actividad reciente:', error);
    res.status(500).json({ error: error.message });
  }
};
