import { AppDataSource } from '../database/data-source';
import { Incidencia } from '../entities/incidencias';
import { User } from '../entities/User';

export class IncidenciaService {
  private repo = AppDataSource.getRepository(Incidencia);
  private userRepo = AppDataSource.getRepository(User);

  async crearIncidencia(docenteId: string, descripcion: string): Promise<Incidencia> {
    const docente = await this.userRepo.findOne({ where: { id: docenteId } });
    if (!docente) throw new Error('Docente no encontrado');

    const incidencia = this.repo.create({
      descripcion,
      docente,
      estado: 'Pendiente',
    });
    return await this.repo.save(incidencia);
  }

  async obtenerTodas(): Promise<Incidencia[]> {
    return this.repo.find({ relations: ['docente'] });
  }

  async actualizarEstado(id: string, estado: string): Promise<Incidencia> {
    const incidencia = await this.repo.findOne({ where: { id } });
    if (!incidencia) throw new Error('Incidencia no encontrada');

    incidencia.estado = estado;
    return await this.repo.save(incidencia);
  }
}
