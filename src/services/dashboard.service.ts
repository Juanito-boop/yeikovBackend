import { AppDataSource } from '../database/data-source';
import { PlanMejora } from '../entities/PlanMejora';
import { PlanAccion } from '../entities/PlanAccion';
import { Evidencia } from '../entities/Evidencia';
import { Incidencia } from '../entities/incidencias';
import { School } from '../entities/School';
import { User } from '../entities/User';
import { MoreThan, LessThan } from 'typeorm';

interface Alerta {
  tipo: string;
  mensaje: string;
  detalle: string;
  cantidad: number;
  prioridad: 'alta' | 'media' | 'baja';
}

interface DepartamentoStats {
  id: string;
  nombre: string;
  totalPlanes: number;
  planesActivos: number;
  planesCompletados: number;
  planesPendientes: number;
  totalDocentes: number;
}

export class DashboardService {
  private planRepo = AppDataSource.getRepository(PlanMejora);
  private accionRepo = AppDataSource.getRepository(PlanAccion);
  private evidenciaRepo = AppDataSource.getRepository(Evidencia);
  private incidenciaRepo = AppDataSource.getRepository(Incidencia);
  private schoolRepo = AppDataSource.getRepository(School);
  private userRepo = AppDataSource.getRepository(User);

  async obtenerAlertas(): Promise<Alerta[]> {
    const alertas: Alerta[] = [];

    // Planes próximos a vencer (acciones con fecha objetivo en los próximos 7 días)
    const hoy = new Date();
    const enSieteDias = new Date();
    enSieteDias.setDate(hoy.getDate() + 7);

    const accionesPorVencer = await this.accionRepo
      .createQueryBuilder('accion')
      .leftJoinAndSelect('accion.plan', 'plan')
      .where('accion.fechaObjetivo IS NOT NULL')
      .andWhere('accion.fechaObjetivo BETWEEN :hoy AND :enSieteDias', { hoy, enSieteDias })
      .andWhere('accion.estado != :completada', { completada: 'Completada' })
      .andWhere('plan.estado = :activo', { activo: 'Activo' })
      .getCount();

    if (accionesPorVencer > 0) {
      alertas.push({
        tipo: 'planes_vencer',
        mensaje: `${accionesPorVencer} acciones próximas a vencer`,
        detalle: 'Requieren atención en los próximos 7 días',
        cantidad: accionesPorVencer,
        prioridad: 'alta'
      });
    }

    // Planes con acciones vencidas
    const accionesVencidas = await this.accionRepo
      .createQueryBuilder('accion')
      .leftJoinAndSelect('accion.plan', 'plan')
      .where('accion.fechaObjetivo IS NOT NULL')
      .andWhere('accion.fechaObjetivo < :hoy', { hoy })
      .andWhere('accion.estado != :completada', { completada: 'Completada' })
      .andWhere('plan.estado = :activo', { activo: 'Activo' })
      .getCount();

    if (accionesVencidas > 0) {
      alertas.push({
        tipo: 'acciones_vencidas',
        mensaje: `${accionesVencidas} acciones vencidas`,
        detalle: 'Requieren atención inmediata',
        cantidad: accionesVencidas,
        prioridad: 'alta'
      });
    }

    // Evidencias recientes (últimas 24 horas) - podrían necesitar revisión
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);

    const evidenciasRecientes = await this.evidenciaRepo
      .createQueryBuilder('evidencia')
      .where('evidencia.createdAt >= :hace24Horas', { hace24Horas })
      .getCount();

    if (evidenciasRecientes > 0) {
      alertas.push({
        tipo: 'evidencias_revisar',
        mensaje: `${evidenciasRecientes} evidencias nuevas`,
        detalle: 'Subidas en las últimas 24 horas',
        cantidad: evidenciasRecientes,
        prioridad: 'media'
      });
    }

    // Incidencias pendientes
    const incidenciasPendientes = await this.incidenciaRepo.count({
      where: { estado: 'Pendiente' }
    });

    if (incidenciasPendientes > 0) {
      alertas.push({
        tipo: 'incidencias_pendientes',
        mensaje: `${incidenciasPendientes} incidencias pendientes`,
        detalle: 'Requieren asignación de plan de mejora',
        cantidad: incidenciasPendientes,
        prioridad: 'media'
      });
    }

    // Planes pendientes de aprobación del decano
    const planesPendientesDecano = await this.planRepo.count({
      where: { estado: 'PendienteDecano' }
    });

    if (planesPendientesDecano > 0) {
      alertas.push({
        tipo: 'planes_pendientes_aprobacion',
        mensaje: `${planesPendientesDecano} planes pendientes de aprobación`,
        detalle: 'Esperando revisión del decano',
        cantidad: planesPendientesDecano,
        prioridad: 'media'
      });
    }

    // Planes rechazados
    const planesRechazados = await this.planRepo.count({
      where: { estado: 'RechazadoDecano' }
    });

    if (planesRechazados > 0) {
      alertas.push({
        tipo: 'planes_rechazados',
        mensaje: `${planesRechazados} planes rechazados`,
        detalle: 'Requieren revisión por el director',
        cantidad: planesRechazados,
        prioridad: 'alta'
      });
    }

    // Si no hay alertas, agregar mensaje de estado normal
    if (alertas.length === 0) {
      alertas.push({
        tipo: 'sin_alertas',
        mensaje: 'Sistema operando normalmente',
        detalle: 'No hay alertas críticas en este momento',
        cantidad: 0,
        prioridad: 'baja'
      });
    }

    return alertas;
  }

  async obtenerEstadisticasGenerales() {
    const totalPlanes = await this.planRepo.count();
    const planesActivos = await this.planRepo.count({ where: { estado: 'Activo' } });
    const planesPendientes = await this.planRepo.count({ where: { estado: 'PendienteDecano' } });
    const planesRechazados = await this.planRepo.count({ where: { estado: 'RechazadoDecano' } });
    const totalIncidencias = await this.incidenciaRepo.count();
    const incidenciasPendientes = await this.incidenciaRepo.count({ where: { estado: 'Pendiente' } });

    return {
      planes: {
        total: totalPlanes,
        activos: planesActivos,
        pendientes: planesPendientes,
        rechazados: planesRechazados
      },
      incidencias: {
        total: totalIncidencias,
        pendientes: incidenciasPendientes
      }
    };
  }

  async obtenerEstadisticasPorDepartamento(): Promise<DepartamentoStats[]> {
    const schools = await this.schoolRepo.find();

    const estadisticas: DepartamentoStats[] = await Promise.all(
      schools.map(async (school) => {
        // Contar planes por facultad
        const totalPlanes = await this.planRepo
          .createQueryBuilder('plan')
          .leftJoin('plan.docente', 'docente')
          .where('docente.schoolId = :schoolId', { schoolId: school.id })
          .getCount();

        const planesActivos = await this.planRepo
          .createQueryBuilder('plan')
          .leftJoin('plan.docente', 'docente')
          .where('docente.schoolId = :schoolId', { schoolId: school.id })
          .andWhere('plan.estado = :estado', { estado: 'Activo' })
          .getCount();

        const planesCompletados = await this.planRepo
          .createQueryBuilder('plan')
          .leftJoin('plan.docente', 'docente')
          .where('docente.schoolId = :schoolId', { schoolId: school.id })
          .andWhere('plan.estado = :estado', { estado: 'Cerrado' })
          .getCount();

        const planesPendientes = await this.planRepo
          .createQueryBuilder('plan')
          .leftJoin('plan.docente', 'docente')
          .where('docente.schoolId = :schoolId', { schoolId: school.id })
          .andWhere('plan.estado IN (:...estados)', { estados: ['PendienteDecano', 'RechazadoDecano'] })
          .getCount();

        // Contar docentes por facultad
        const totalDocentes = await this.userRepo
          .createQueryBuilder('user')
          .leftJoin('user.role', 'role')
          .where('user.schoolId = :schoolId', { schoolId: school.id })
          .andWhere('role.nombre = :roleName', { roleName: 'Docente' })
          .getCount();

        return {
          id: school.id,
          nombre: school.nombre,
          totalPlanes,
          planesActivos,
          planesCompletados,
          planesPendientes,
          totalDocentes
        };
      })
    );

    // Ordenar por total de planes (descendente)
    return estadisticas.sort((a, b) => b.totalPlanes - a.totalPlanes);
  }
}
