import { AppDataSource } from '../database/data-source';
import { AuditLog } from '../entities/AuditLog';
import { User } from '../entities/User';
import { Between, Like } from 'typeorm';

interface RegistrarAccionParams {
  entidad: string;
  entidadId: string;
  accion: string;
  descripcion: string;
  usuarioId: string;
  entidadAfectada?: string;
  datosPrevios?: any;
  datosNuevos?: any;
  ipAddress?: string;
  userAgent?: string;
}

interface FiltrosAuditoria {
  entidad?: string;
  accion?: string;
  usuarioId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  busqueda?: string;
  limit?: number;
  offset?: number;
}

export class AuditService {
  private repo = AppDataSource.getRepository(AuditLog);
  private userRepo = AppDataSource.getRepository(User);

  async registrarAccion(params: RegistrarAccionParams): Promise<void> {
    try {
      const usuario = await this.userRepo.findOne({ where: { id: params.usuarioId } });
      if (!usuario) {
        console.warn(`Usuario no encontrado para auditoría: ${params.usuarioId}`);
        return;
      }

      const log = this.repo.create({
        entidad: params.entidad,
        entidadId: params.entidadId,
        accion: params.accion,
        descripcion: params.descripcion,
        entidadAfectada: params.entidadAfectada,
        datosPrevios: params.datosPrevios,
        datosNuevos: params.datosNuevos,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        usuario,
      });

      await this.repo.save(log);
    } catch (error) {
      console.error('Error al registrar acción de auditoría:', error);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }

  async listarLogs(filtros: FiltrosAuditoria = {}): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.repo
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.usuario', 'usuario')
      .orderBy('audit.createdAt', 'DESC');

    // Filtros
    if (filtros.entidad) {
      queryBuilder.andWhere('audit.entidad = :entidad', { entidad: filtros.entidad });
    }

    if (filtros.accion) {
      queryBuilder.andWhere('audit.accion = :accion', { accion: filtros.accion });
    }

    if (filtros.usuarioId) {
      queryBuilder.andWhere('audit.usuario.id = :usuarioId', { usuarioId: filtros.usuarioId });
    }

    if (filtros.fechaInicio && filtros.fechaFin) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :inicio AND :fin', {
        inicio: filtros.fechaInicio,
        fin: filtros.fechaFin,
      });
    }

    if (filtros.busqueda) {
      queryBuilder.andWhere(
        '(audit.descripcion ILIKE :busqueda OR audit.entidadAfectada ILIKE :busqueda)',
        { busqueda: `%${filtros.busqueda}%` }
      );
    }

    const total = await queryBuilder.getCount();

    // Paginación
    if (filtros.limit) {
      queryBuilder.take(filtros.limit);
    }
    if (filtros.offset) {
      queryBuilder.skip(filtros.offset);
    }

    const logs = await queryBuilder.getMany();

    return { logs, total };
  }

  async obtenerEstadisticas(fechaInicio?: Date, fechaFin?: Date) {
    const queryBuilder = this.repo.createQueryBuilder('audit');

    if (fechaInicio && fechaFin) {
      queryBuilder.where('audit.createdAt BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      });
    }

    const total = await queryBuilder.getCount();

    const porEntidad = await queryBuilder
      .select('audit.entidad', 'entidad')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.entidad')
      .getRawMany();

    const porAccion = await queryBuilder
      .select('audit.accion', 'accion')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.accion')
      .getRawMany();

    const usuariosMasActivos = await this.repo
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.usuario', 'usuario')
      .select('usuario.id', 'id')
      .addSelect('usuario.nombre', 'nombre')
      .addSelect('usuario.apellido', 'apellido')
      .addSelect('COUNT(*)', 'count')
      .groupBy('usuario.id, usuario.nombre, usuario.apellido')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total,
      porEntidad,
      porAccion,
      usuariosMasActivos,
    };
  }

  // Métodos de conveniencia para acciones específicas
  async registrarCreacionPlan(planId: string, planTitulo: string, docenteNombre: string, usuarioId: string, ip?: string, userAgent?: string) {
    await this.registrarAccion({
      entidad: 'Plan',
      entidadId: planId,
      accion: 'ASIGNAR',
      descripcion: `Plan "${planTitulo}" asignado a ${docenteNombre}`,
      entidadAfectada: docenteNombre,
      usuarioId,
      ipAddress: ip,
      userAgent,
    });
  }

  async registrarAprobacionPlan(planId: string, planTitulo: string, estado: string, usuarioId: string, ip?: string, userAgent?: string) {
    await this.registrarAccion({
      entidad: 'Plan',
      entidadId: planId,
      accion: estado === 'AprobadoDecano' ? 'APROBAR' : 'RECHAZAR',
      descripcion: `Plan "${planTitulo}" ${estado === 'AprobadoDecano' ? 'aprobado' : 'rechazado'} por decano`,
      entidadAfectada: planTitulo,
      usuarioId,
      ipAddress: ip,
      userAgent,
    });
  }

  async registrarCreacionUsuario(usuarioId: string, usuarioNombre: string, rol: string, creadorId: string, ip?: string, userAgent?: string) {
    await this.registrarAccion({
      entidad: 'Usuario',
      entidadId: usuarioId,
      accion: 'CREATE',
      descripcion: `Usuario ${usuarioNombre} creado con rol ${rol}`,
      entidadAfectada: usuarioNombre,
      usuarioId: creadorId,
      ipAddress: ip,
      userAgent,
    });
  }

  async registrarActualizacionUsuario(usuarioId: string, usuarioNombre: string, cambios: string, actualizadorId: string, ip?: string, userAgent?: string) {
    await this.registrarAccion({
      entidad: 'Usuario',
      entidadId: usuarioId,
      accion: 'UPDATE',
      descripcion: `Usuario ${usuarioNombre} actualizado: ${cambios}`,
      entidadAfectada: usuarioNombre,
      usuarioId: actualizadorId,
      ipAddress: ip,
      userAgent,
    });
  }

  async registrarDesactivacionUsuario(usuarioId: string, usuarioNombre: string, desactivadorId: string, ip?: string, userAgent?: string) {
    await this.registrarAccion({
      entidad: 'Usuario',
      entidadId: usuarioId,
      accion: 'DEACTIVATE',
      descripcion: `Usuario ${usuarioNombre} desactivado`,
      entidadAfectada: usuarioNombre,
      usuarioId: desactivadorId,
      ipAddress: ip,
      userAgent,
    });
  }

  async registrarSubidaEvidencia(evidenciaId: string, planTitulo: string, usuarioId: string, ip?: string, userAgent?: string) {
    await this.registrarAccion({
      entidad: 'Evidencia',
      entidadId: evidenciaId,
      accion: 'CREATE',
      descripcion: `Evidencia subida para plan "${planTitulo}"`,
      entidadAfectada: planTitulo,
      usuarioId,
      ipAddress: ip,
      userAgent,
    });
  }

  async registrarLogin(usuarioId: string, usuarioNombre: string, ip?: string, userAgent?: string) {
    await this.registrarAccion({
      entidad: 'Autenticación',
      entidadId: usuarioId,
      accion: 'LOGIN',
      descripcion: `${usuarioNombre} inició sesión`,
      entidadAfectada: usuarioNombre,
      usuarioId,
      ipAddress: ip,
      userAgent,
    });
  }
}
