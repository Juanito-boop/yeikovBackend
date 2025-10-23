import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';
import { RoleType } from '../entities/Role';

export class DocenteService {
  private userRepo = AppDataSource.getRepository(User);

  /**
   * Retorna todos los usuarios con rol DOCENTE.
   * Si se pasa schoolId, filtra por facultad.
   */
  async getAllDocentes(schoolId?: string): Promise<User[]> {
    const query = this.userRepo
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.school', 'school')
      .where('role.nombre = :nombre', { nombre: RoleType.DOCENTE })
      .andWhere('user.activo = :activo', { activo: true });

    if (schoolId) {
      query.andWhere('user.school_id = :schoolId', { schoolId });
    }

    return query.getMany();
  }
}
