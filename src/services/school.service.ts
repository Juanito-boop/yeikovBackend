import { AppDataSource } from '../database/data-source';
import { School } from '../entities/School';

export class SchoolService {
  private schoolRepo = AppDataSource.getRepository(School);

  /**
   * Retorna todas las escuelas / facultades registradas.
   */
  async getAllSchools(): Promise<School[]> {
    return this.schoolRepo.find({
      order: { nombre: 'ASC' },
    });
  }

  /**
   * Retorna una escuela por ID (con sus usuarios opcionalmente).
   */
  async getSchoolById(id: string, includeUsers = false): Promise<School | null> {
    if (includeUsers) {
      return this.schoolRepo.findOne({
        where: { id },
        relations: ['users', 'users.role'],
      });
    }

    return this.schoolRepo.findOne({ where: { id } });
  }
}
