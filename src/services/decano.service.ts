import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';
import { PlanMejora } from '../entities/PlanMejora';
import { RoleType } from '../entities/Role';

export class DecanoService {
  private userRepo = AppDataSource.getRepository(User);
  private planRepo = AppDataSource.getRepository(PlanMejora);

  /**
   * Obtiene estadísticas del decano filtradas por su facultad
   */
  async getDecanoStats(userId: string) {
    // Obtener el usuario decano con su facultad
    const decano = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['school', 'role'],
    });

    if (!decano || !decano.school) {
      throw new Error('Decano no encontrado o sin facultad asignada');
    }

    const schoolId = decano.school.id;

    // Contar docentes de la facultad
    const totalDocentes = await this.userRepo.count({
      where: {
        role: { nombre: RoleType.DOCENTE },
        school: { id: schoolId },
        activo: true,
      },
    });

    // Obtener planes de la facultad
    const planes = await this.planRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.docente', 'docente')
      .leftJoinAndSelect('docente.school', 'school')
      .where('school.id = :schoolId', { schoolId })
      .getMany();

    const totalPlanes = planes.length;
    const planesCompletados = planes.filter(
      (p) => p.estado === 'Cerrado' || p.estado === 'Completado'
    ).length;
    const tasaCumplimiento =
      totalPlanes > 0 ? Math.round((planesCompletados / totalPlanes) * 100) : 0;

    return {
      totalDocentes,
      totalPlanes,
      planesCompletados,
      tasaCumplimiento,
    };
  }

  /**
   * Obtiene reportes de la facultad del decano
   */
  async getReportesDecano(userId: string) {
    const decano = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['school'],
    });

    if (!decano || !decano.school) {
      throw new Error('Decano no encontrado o sin facultad asignada');
    }

    const schoolId = decano.school.id;

    // Obtener todos los planes de la facultad
    const planes = await this.planRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.docente', 'docente')
      .leftJoinAndSelect('docente.school', 'school')
      .leftJoinAndSelect('plan.acciones', 'acciones')
      .where('school.id = :schoolId', { schoolId })
      .getMany();

    // Obtener docentes de la facultad
    const docentes = await this.userRepo.count({
      where: {
        role: { nombre: RoleType.DOCENTE },
        school: { id: schoolId },
        activo: true,
      },
    });

    return {
      totalPlanes: planes.length,
      totalDocentes: docentes,
      planesCompletados: planes.filter(
        (p) => p.estado === 'Cerrado' || p.estado === 'Completado'
      ).length,
      tasaCumplimiento:
        planes.length > 0
          ? Math.round(
            (planes.filter((p) => p.estado === 'Cerrado' || p.estado === 'Completado')
              .length /
              planes.length) *
            100
          )
          : 0,
    };
  }

  /**
   * Obtiene datos de departamentos de la facultad (simulado por ahora)
   * En el futuro se puede agregar una entidad Department
   */
  async getDepartamentos(userId: string) {
    const decano = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['school'],
    });

    if (!decano || !decano.school) {
      throw new Error('Decano no encontrado o sin facultad asignada');
    }

    const schoolId = decano.school.id;

    // Obtener planes y docentes agrupados
    const docentes = await this.userRepo.find({
      where: {
        role: { nombre: RoleType.DOCENTE },
        school: { id: schoolId },
        activo: true,
      },
    });

    const planes = await this.planRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.docente', 'docente')
      .leftJoinAndSelect('docente.school', 'school')
      .where('school.id = :schoolId', { schoolId })
      .getMany();

    // Por ahora retornamos un resumen general de la facultad
    // En el futuro se puede dividir por departamentos reales
    const planesCompletados = planes.filter(
      (p) => p.estado === 'Cerrado' || p.estado === 'Completado'
    ).length;

    return [
      {
        nombre: decano.school.nombre,
        docentes: docentes.length,
        planes: planes.length,
        cumplimiento:
          planes.length > 0
            ? Math.round((planesCompletados / planes.length) * 100)
            : 0,
      },
    ];
  }

  /**
   * Obtiene todos los planes de la facultad del decano
   */
  async listarPlanesDeFacultad(userId: string) {
    const decano = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['school', 'role'],
    });

    if (!decano || decano.role.nombre !== RoleType.DECANO) {
      throw new Error('Usuario no es decano');
    }

    if (!decano.school) {
      throw new Error('Decano no tiene facultad asignada');
    }

    // Obtener todos los planes de docentes de la facultad del decano
    return this.planRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.docente', 'docente')
      .leftJoinAndSelect('docente.school', 'school')
      .leftJoinAndSelect('plan.creadoPor', 'creadoPor')
      .leftJoinAndSelect('plan.incidencia', 'incidencia')
      .leftJoinAndSelect('plan.acciones', 'acciones')
      .leftJoinAndSelect('plan.aprobaciones', 'aprobaciones')
      .leftJoinAndSelect('aprobaciones.aprobadoPor', 'aprobadoPor')
      .where('docente.schoolId = :schoolId', { schoolId: decano.school.id })
      .orderBy('plan.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Obtiene todos los docentes de la facultad del decano
   */
  async listarDocentesDeFacultad(userId: string) {
    const decano = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['school', 'role'],
    });

    if (!decano || decano.role.nombre !== RoleType.DECANO) {
      throw new Error('Usuario no es decano');
    }

    if (!decano.school) {
      throw new Error('Decano no tiene facultad asignada');
    }

    // Obtener todos los docentes de la facultad del decano
    return this.userRepo.find({
      where: {
        role: { nombre: RoleType.DOCENTE },
        schoolId: decano.school.id,
        activo: true,
      },
      relations: ['school', 'role'],
      order: {
        apellido: 'ASC',
        nombre: 'ASC',
      },
    });
  }
}
