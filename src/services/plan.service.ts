import { AppDataSource } from '../database/data-source';
import { PlanMejora } from '../entities/PlanMejora';
import { User } from '../entities/User';
import { Incidencia } from '../entities/incidencias';
import { Aprobacion } from '../entities/Aprobacion';
import { RoleType } from '../entities/Role';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { NotificationType } from '../entities/Notification';

export class PlanService {
  private planRepo = AppDataSource.getRepository(PlanMejora);
  private userRepo = AppDataSource.getRepository(User);
  private incidenciaRepo = AppDataSource.getRepository(Incidencia);
  private aprobacionRepo = AppDataSource.getRepository(Aprobacion);
  private auditService = new AuditService();
  private notificationService = new NotificationService();

  async crearPlan(data: {
    titulo: string;
    descripcion: string;
    docenteId: string;
    directorId: string;
    incidenciaId?: string;
  }): Promise<PlanMejora> {
    const docente = await this.userRepo.findOne({
      where: { id: data.docenteId },
      relations: ['school', 'role']
    });
    if (!docente) throw new Error('Docente no encontrado');
    if (docente.role.nombre !== RoleType.DOCENTE) {
      throw new Error('El usuario asignado debe ser un docente');
    }

    const director = await this.userRepo.findOne({
      where: { id: data.directorId },
      relations: ['role']
    });
    if (!director) throw new Error('Director no encontrado');

    const incidencia = data.incidenciaId
      ? await this.incidenciaRepo.findOne({ where: { id: data.incidenciaId } })
      : null;

    // El plan inicia en estado PendienteDecano
    const plan = this.planRepo.create({
      titulo: data.titulo,
      descripcion: data.descripcion,
      docente,
      creadoPor: director,
      incidencia,
      estado: 'PendienteDecano',
    });

    const savedPlan = await this.planRepo.save(plan);

    // Registrar en auditoría
    await this.auditService.registrarCreacionPlan(
      savedPlan.id,
      savedPlan.titulo,
      `${docente.nombre} ${docente.apellido}`,
      director.id
    );

    // Notificar al decano de la facultad del docente
    if (docente.schoolId) {
      const decano = await this.userRepo.findOne({
        where: {
          schoolId: docente.schoolId,
          role: { nombre: RoleType.DECANO }
        },
        relations: ['role']
      });

      if (decano) {
        await this.notificationService.create({
          userId: decano.id,
          tipo: NotificationType.PLAN_PENDIENTE,
          asunto: 'Nuevo Plan de Mejora Pendiente de Aprobación',
          mensaje: `Se ha creado un nuevo plan de mejora "${savedPlan.titulo}" para el docente ${docente.nombre} ${docente.apellido} que requiere su aprobación.`,
          enviarEmail: true
        });
      }
    }

    // Retornar el plan con las relaciones cargadas
    return await this.planRepo.findOne({
      where: { id: savedPlan.id },
      relations: ['docente', 'docente.school', 'creadoPor', 'incidencia']
    }) as PlanMejora;
  }

  async obtenerPorId(id: string): Promise<PlanMejora | null> {
    return this.planRepo.findOne({
      where: { id },
      relations: ['docente', 'incidencia', 'acciones', 'aprobaciones'],
    });
  }

  async listarPlanes(): Promise<PlanMejora[]> {
    return this.planRepo.find({
      relations: ['docente', 'docente.school', 'acciones', 'aprobaciones'],
      order: { createdAt: 'DESC' }
    });
  }

  async listarPlanesPorDocente(docenteId: string): Promise<PlanMejora[]> {
    // Solo mostrar planes activos al docente
    return this.planRepo.find({
      where: { docente: { id: docenteId }, estado: 'Activo' },
      relations: ['docente', 'incidencia', 'acciones', 'acciones.evidencias', 'aprobaciones', 'creadoPor']
    });
  }

  async listarPlanesPendientesDecano(decanoId: string): Promise<PlanMejora[]> {
    const decano = await this.userRepo.findOne({
      where: { id: decanoId },
      relations: ['school', 'role']
    });
    if (!decano || decano.role.nombre !== RoleType.DECANO) {
      throw new Error('Usuario no es decano');
    }

    // Obtener planes pendientes de la facultad del decano usando query builder
    return this.planRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.docente', 'docente')
      .leftJoinAndSelect('docente.school', 'school')
      .leftJoinAndSelect('plan.creadoPor', 'creadoPor')
      .leftJoinAndSelect('plan.incidencia', 'incidencia')
      .leftJoinAndSelect('plan.aprobaciones', 'aprobaciones')
      .leftJoinAndSelect('aprobaciones.aprobadoPor', 'aprobadoPor')
      .where('plan.estado = :estado', { estado: 'PendienteDecano' })
      .andWhere('docente.schoolId = :schoolId', { schoolId: decano.schoolId })
      .orderBy('plan.createdAt', 'DESC')
      .getMany();
  }

  async listarPlanesRechazadosPorDirector(directorId: string): Promise<PlanMejora[]> {
    // Planes rechazados por decano que fueron creados por este director
    return this.planRepo.find({
      where: {
        estado: 'RechazadoDecano',
        creadoPor: { id: directorId }
      },
      relations: ['docente', 'docente.school', 'creadoPor', 'incidencia', 'aprobaciones', 'aprobaciones.aprobadoPor'],
      order: { createdAt: 'DESC' }
    });
  }

  async enviarARevision(id: string): Promise<PlanMejora> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new Error('Plan no encontrado');
    plan.estado = 'EnRevisión';
    return await this.planRepo.save(plan);
  }

  async aprobarPorDecano(id: string, decanoId: string, aprobado: boolean, comentarios?: string): Promise<PlanMejora> {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['docente', 'docente.school', 'creadoPor']
    });
    const decano = await this.userRepo.findOne({
      where: { id: decanoId },
      relations: ['role', 'school']
    });

    if (!plan) throw new Error('Plan no encontrado');
    if (!decano) throw new Error('Decano no encontrado');
    if (decano.role.nombre !== RoleType.DECANO) {
      throw new Error('Solo un decano puede aprobar planes');
    }

    // Verificar que el decano sea de la misma facultad que el docente
    if (plan.docente.schoolId !== decano.schoolId) {
      throw new Error('El decano no pertenece a la misma facultad del docente');
    }

    // Verificar que el plan esté en estado correcto
    if (plan.estado !== 'PendienteDecano') {
      throw new Error('El plan no está pendiente de aprobación del decano');
    }

    // Registrar la aprobación/rechazo
    const registro = this.aprobacionRepo.create({
      plan,
      nivel: 'Decano',
      aprobado,
      comentarios,
      aprobadoPor: decano,
    });
    await this.aprobacionRepo.save(registro);

    // Actualizar estado del plan
    if (aprobado) {
      plan.estado = 'Activo'; // Ahora el docente puede trabajar en él
    } else {
      plan.estado = 'RechazadoDecano'; // Vuelve al director
    }
    await this.planRepo.save(plan);

    // Registrar en auditoría
    await this.auditService.registrarAprobacionPlan(
      plan.id,
      plan.titulo,
      plan.estado,
      decano.id
    );

    // Enviar notificaciones por correo
    if (aprobado) {
      // Notificar al docente que su plan fue aprobado y está activo
      await this.notificationService.create({
        userId: plan.docente.id,
        tipo: NotificationType.PLAN_ACTIVO,
        asunto: 'Plan de Mejora Aprobado',
        mensaje: `Su plan de mejora "${plan.titulo}" ha sido aprobado por el decano y ahora está activo. Puede comenzar a trabajar en él.`,
        enviarEmail: true
      });
    } else {
      // Notificar al director que creó el plan que fue rechazado
      await this.notificationService.create({
        userId: plan.creadoPor.id,
        tipo: NotificationType.PLAN_RECHAZADO,
        asunto: 'Plan de Mejora Rechazado',
        mensaje: `El plan de mejora "${plan.titulo}" para el docente ${plan.docente.nombre} ${plan.docente.apellido} ha sido rechazado por el decano.${comentarios ? ` Comentarios: ${comentarios}` : ''}`,
        enviarEmail: true
      });
    }

    return await this.planRepo.findOne({
      where: { id },
      relations: ['docente', 'docente.school', 'creadoPor', 'aprobaciones', 'aprobaciones.aprobadoPor']
    }) as PlanMejora;
  }

  async reenviarPlanADecano(id: string, directorId: string): Promise<PlanMejora> {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['creadoPor', 'docente']
    });
    const director = await this.userRepo.findOne({
      where: { id: directorId },
      relations: ['role']
    });

    if (!plan) throw new Error('Plan no encontrado');
    if (!director) throw new Error('Director no encontrado');
    if (director.role.nombre !== RoleType.DIRECTOR) {
      throw new Error('Solo un director puede reenviar planes');
    }
    if (plan.creadoPor.id !== directorId) {
      throw new Error('Solo el director que creó el plan puede reenviarlo');
    }
    if (plan.estado !== 'RechazadoDecano') {
      throw new Error('Solo se pueden reenviar planes rechazados por el decano');
    }

    // Cambiar estado a PendienteDecano nuevamente
    plan.estado = 'PendienteDecano';
    await this.planRepo.save(plan);

    // Notificar al decano que hay un plan reenviado para revisión
    if (plan.docente.schoolId) {
      const decano = await this.userRepo.findOne({
        where: {
          schoolId: plan.docente.schoolId,
          role: { nombre: RoleType.DECANO }
        },
        relations: ['role']
      });

      if (decano) {
        await this.notificationService.create({
          userId: decano.id,
          tipo: NotificationType.PLAN_PENDIENTE,
          asunto: 'Plan de Mejora Reenviado para Revisión',
          mensaje: `El plan de mejora "${plan.titulo}" para el docente ${plan.docente.nombre} ${plan.docente.apellido} ha sido reenviado para su revisión.`,
          enviarEmail: true
        });
      }
    }

    return await this.planRepo.findOne({
      where: { id },
      relations: ['docente', 'docente.school', 'creadoPor', 'aprobaciones']
    }) as PlanMejora;
  }

  async aprobarPlan(id: string, aprobadoPorId: string, aprobado: boolean, comentarios?: string): Promise<void> {
    const plan = await this.planRepo.findOne({ where: { id } });
    const usuario = await this.userRepo.findOne({ where: { id: aprobadoPorId }, relations: ['role'] });

    if (!plan || !usuario) throw new Error('Datos inválidos');

    const registro = this.aprobacionRepo.create({
      plan,
      nivel: usuario.role.nombre as RoleType,
      aprobado,
      comentarios,
      aprobadoPor: usuario,
    });
    await this.aprobacionRepo.save(registro);

    // Cambiar estado si se aprueba en todos los niveles
    if (aprobado && usuario.role.nombre === RoleType.DIRECTOR) {
      plan.estado = 'Aprobado';
    } else if (!aprobado) {
      plan.estado = 'Rechazado';
    }
    await this.planRepo.save(plan);
  }

  async cerrarPlan(id: string): Promise<PlanMejora> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new Error('Plan no encontrado');
    plan.estado = 'Cerrado';
    return await this.planRepo.save(plan);
  }
}
