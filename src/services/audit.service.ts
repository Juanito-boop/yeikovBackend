import { AppDataSource } from '../database/data-source';
import { AuditLog } from '../entities/AuditLog';
import { User } from '../entities/User';

export class AuditService {
  private repo = AppDataSource.getRepository(AuditLog);
  private userRepo = AppDataSource.getRepository(User);

  async registrarAccion(
    entidad: string,
    entidadId: string,
    accion: 'CREATE' | 'UPDATE' | 'DELETE',
    usuarioId: string,
    datosPrevios?: any,
    datosNuevos?: any
  ): Promise<void> {
    const usuario = await this.userRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new Error('Usuario no encontrado');

    const log = this.repo.create({
      entidad,
      entidadId,
      accion,
      datosPrevios,
      datosNuevos,
      usuario,
    });

    await this.repo.save(log);
  }

  async listarLogs(entidad?: string): Promise<AuditLog[]> {
    const where = entidad ? { entidad } : {};
    return this.repo.find({ where, relations: ['usuario'], order: { createdAt: 'DESC' } });
  }
}
