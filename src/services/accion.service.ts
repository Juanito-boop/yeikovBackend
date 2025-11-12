import { AppDataSource } from '../database/data-source';
import { PlanAccion } from '../entities/PlanAccion';
import { PlanMejora } from '../entities/PlanMejora';

export class AccionService {
  private repo = AppDataSource.getRepository(PlanAccion);
  private planRepo = AppDataSource.getRepository(PlanMejora);

  async crearAccion(planId: string, descripcion: string, fechaObjetivo?: Date): Promise<PlanAccion> {
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new Error('Plan no encontrado');

    const accion = this.repo.create({ descripcion, plan, fechaObjetivo });
    return await this.repo.save(accion);
  }

  async actualizarEstado(id: string, estado: string): Promise<PlanAccion> {
    const accion = await this.repo.findOne({ where: { id } });
    if (!accion) throw new Error('Acción no encontrada');
    accion.estado = estado;
    return await this.repo.save(accion);
  }

  async obtenerPorPlan(planId: string): Promise<PlanAccion[]> {
    return this.repo.find({ where: { plan: { id: planId } }, relations: ['evidencias'] });
  }
}
