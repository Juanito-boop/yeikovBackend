import { AppDataSource } from '../database/data-source';
import { PlanMejora } from '../entities/PlanMejora';
import { User } from '../entities/User';
import { Incidencia } from '../entities/incidencias';
import { Aprobacion } from '../entities/Aprobacion';
import { RoleType } from '../entities/Role';

export class PlanService {
  private planRepo = AppDataSource.getRepository(PlanMejora);
  private userRepo = AppDataSource.getRepository(User);
  private incidenciaRepo = AppDataSource.getRepository(Incidencia);
  private aprobacionRepo = AppDataSource.getRepository(Aprobacion);

  async crearPlan(data: {
    titulo: string;
    descripcion: string;
    docenteId: string;
    incidenciaId?: string;
  }): Promise<PlanMejora> {
    const docente = await this.userRepo.findOne({ where: { id: data.docenteId } });
    if (!docente) throw new Error('Docente no encontrado');

    const incidencia = data.incidenciaId
      ? await this.incidenciaRepo.findOne({ where: { id: data.incidenciaId } })
      : null;

    const plan = this.planRepo.create({
      titulo: data.titulo,
      descripcion: data.descripcion,
      docente,
      incidencia,
      estado: 'Borrador',
    });

    return await this.planRepo.save(plan);
  }

  async obtenerPorId(id: string): Promise<PlanMejora | null> {
    return this.planRepo.findOne({
      where: { id },
      relations: ['docente', 'incidencia', 'acciones', 'aprobaciones'],
    });
  }

  async listarPlanes(): Promise<PlanMejora[]> {
    return this.planRepo.find({ relations: ['docente', 'acciones', 'aprobaciones'] });
  }

  async enviarARevision(id: string): Promise<PlanMejora> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new Error('Plan no encontrado');
    plan.estado = 'EnRevisión';
    return await this.planRepo.save(plan);
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
