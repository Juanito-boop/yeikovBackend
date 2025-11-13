import { AppDataSource } from '../database/data-source';
import { School } from '../entities/School';

export class SchoolService {
  private schoolRepo = AppDataSource.getRepository(School);

  /**
   * Retorna todas las escuelas / facultades registradas.
   */
  async getAllSchools(): Promise<any[]> {
    const schools = await this.schoolRepo.find({
      order: { nombre: 'ASC' },
      relations: ['users'],
    });

    // Agregar conteo de docentes como propiedad adicional
    return schools.map(school => ({
      id: school.id,
      nombre: school.nombre,
      direccion: school.direccion,
      cantidadDocentes: school.users?.length || 0
    }));
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

  /**
   * Crea una nueva escuela / facultad.
   */
  async createSchool(nombre: string): Promise<School> {
    // Verificar si ya existe una escuela con ese nombre
    const existente = await this.schoolRepo.findOne({
      where: { nombre }
    });

    if (existente) {
      throw new Error('Ya existe una facultad con ese nombre');
    }

    const school = this.schoolRepo.create({
      nombre,
      direccion: 'Sin dirección' // Dirección por defecto
    });
    return this.schoolRepo.save(school);
  }

  /**
   * Actualiza una escuela / facultad.
   */
  async updateSchool(id: string, nombre: string): Promise<School> {
    const school = await this.getSchoolById(id);
    if (!school) {
      throw new Error('Facultad no encontrada');
    }

    school.nombre = nombre;
    return this.schoolRepo.save(school);
  }

  /**
   * Elimina una escuela / facultad.
   */
  async deleteSchool(id: string): Promise<void> {
    const school = await this.getSchoolById(id, true);
    if (!school) {
      throw new Error('Facultad no encontrada');
    }

    // Verificar si tiene usuarios asociados
    if (school.users && school.users.length > 0) {
      throw new Error('No se puede eliminar una facultad con usuarios asociados');
    }

    await this.schoolRepo.remove(school);
  }
}
