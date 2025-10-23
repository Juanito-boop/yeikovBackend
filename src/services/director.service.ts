import { AppDataSource } from '../database/data-source';
import { School } from '../entities/School';
import { User } from '../entities/User';
import { Plan } from '../entities/Plan';
import { RoleType } from '../entities/Role';
import { PlanAsignacionService } from './planAsignacion.service';
import { DocenteService } from './docente.service';

export class PrincipalService {
  private schoolRepo = AppDataSource.getRepository(School);
  private userRepo = AppDataSource.getRepository(User);
  private planRepo = AppDataSource.getRepository(Plan);
  private docenteService = new DocenteService();
  private planAsignacion = new PlanAsignacionService();

  // 🔹 Cantidad total de escuelas
  async countSchools(): Promise<number> {
    return this.schoolRepo.count();
  }

  // 🔹 Cantidad de usuarios con rol DOCENTE
  async countDocenteUsers(): Promise<number> {
    return this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .where('role.nombre = :nombre', { nombre: RoleType.DOCENTE })
      .getCount();
  }

  // 🔹 Cantidad total de planes asignados a docentes
  async countPlanesByDocentes(): Promise<number> {
    return this.planRepo
      .createQueryBuilder('plan')
      .innerJoin('plan.user', 'user')
      .innerJoin('user.role', 'role')
      .where('role.nombre = :nombre', { nombre: RoleType.DOCENTE })
      .getCount();
  }

  // 🔹 Cantidad de planes por escuela (solo docentes)
  async countPlanesBySchoolForDocentes(): Promise<
    { schoolName: string; totalPlanes: number }[]
  > {
    const result = await this.planRepo
      .createQueryBuilder('plan')
      .innerJoin('plan.user', 'user')
      .innerJoin('user.role', 'role')
      .innerJoin('user.school', 'school')
      .where('role.nombre = :nombre', { nombre: RoleType.DOCENTE })
      .select('school.nombre', 'schoolName')
      .addSelect('COUNT(plan.id)', 'totalPlanes')
      .groupBy('school.id')
      .addGroupBy('school.nombre')
      .getRawMany();

    return result;
  }

  // 🔹 Obtener todas las escuelas registradas
  async getAllSchools(): Promise<School[]> {
    return this.schoolRepo.find({
      relations: ['users'], // opcional, solo si necesitas los usuarios asociados
    });
  }
}
