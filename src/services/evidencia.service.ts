import { AppDataSource } from '../database/data-source';
import { Evidencia } from '../entities/Evidencia';
import { PlanAccion } from '../entities/PlanAccion';
import { User } from '../entities/User';

export class EvidenciaService {
  private repo = AppDataSource.getRepository(Evidencia);
  private accionRepo = AppDataSource.getRepository(PlanAccion);
  private userRepo = AppDataSource.getRepository(User);

  async subirEvidencia(accionId: string, file: Express.Multer.File, userId: string, comentario?: string): Promise<Evidencia> {
    const accion = await this.accionRepo.findOne({ where: { id: accionId } });
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!accion || !user) throw new Error('Datos inválidos');

    const evidencia = this.repo.create({
      accion,
      filename: file.originalname,
      path: file.path,
      comentario,
      uploadedBy: user,
    });
    return await this.repo.save(evidencia);
  }

  async obtenerPorAccion(accionId: string): Promise<Evidencia[]> {
    return this.repo.find({ where: { accion: { id: accionId } }, relations: ['uploadedBy'] });
  }
}
