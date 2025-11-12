import { AppDataSource } from '../database/data-source';
import { Aprobacion } from '../entities/Aprobacion';

export class AprobacionService {
  private repo = AppDataSource.getRepository(Aprobacion);

  async obtenerPorPlan(planId: string): Promise<Aprobacion[]> {
    return this.repo.find({ where: { plan: { id: planId } }, relations: ['aprobadoPor'] });
  }

  async eliminar(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
