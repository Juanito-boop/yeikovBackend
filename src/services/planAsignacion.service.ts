import { AppDataSource } from '../database/data-source';
import { Plan } from '../entities/Plan';
import { User } from '../entities/User';
import { RoleType } from '../entities/Role';

export class PlanAsignacionService {
  private planRepo = AppDataSource.getRepository(Plan);
  private userRepo = AppDataSource.getRepository(User);

  /**
   * Asigna un nuevo plan a un docente.
   * @param userId ID del docente
   * @param data Datos del plan ({ nombre, descripcion })
   */
  async asignarPlanADocente(
    userId: string,
    data: { nombre: string; descripcion: string }
  ): Promise<Plan> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    if (user.role.nombre !== RoleType.DOCENTE) {
      throw new Error('El plan solo puede asignarse a un docente.');
    }

    const nuevoPlan = this.planRepo.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      user: user,
    });

    return await this.planRepo.save(nuevoPlan);
  }
}
