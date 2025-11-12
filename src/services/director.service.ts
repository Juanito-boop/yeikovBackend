import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';
import { School } from '../entities/School';
import { PlanMejora } from '../entities/PlanMejora';
import { RoleType } from '../entities/Role';

export class DirectorService {
  private userRepo = AppDataSource.getRepository(User);
  private schoolRepo = AppDataSource.getRepository(School);
  private planRepo = AppDataSource.getRepository(PlanMejora);

  async getCounts() {
    const totalSchools = await this.schoolRepo.count();
    const totalDocentes = await this.userRepo.count({
      where: { role: { nombre: RoleType.DOCENTE } },
    });
    const totalPlanes = await this.planRepo.count();

    // Obtener docentes con su escuela
    const docentes = await this.userRepo.find({
      where: { role: { nombre: RoleType.DOCENTE } },
      relations: ['school'],
    });

    // Obtener planes con su docente y escuela
    const planes = await this.planRepo.find({
      relations: ['docente', 'docente.school'],
    });

    const planesPorEscuela: {
      schoolName: string;
      totalPlanes: number;
      docentes: number;
      planesCompletados: number;
      calidad: number;
    }[] = [];

    const stats: Record<string, { docentes: number; totalPlanes: number; completados: number }> = {};

    for (const docente of docentes) {
      const escuela = docente.school?.nombre || 'Sin asignar';
      if (!stats[escuela]) {
        stats[escuela] = { docentes: 0, totalPlanes: 0, completados: 0 };
      }
      stats[escuela].docentes += 1;
    }

    for (const plan of planes) {
      const escuela = plan.docente?.school?.nombre || 'Sin asignar';
      if (!stats[escuela]) {
        stats[escuela] = { docentes: 0, totalPlanes: 0, completados: 0 };
      }
      stats[escuela].totalPlanes += 1;

      if (plan.estado === 'Cerrado' || plan.estado === 'Completado') {
        stats[escuela].completados += 1;
      }
    }

    for (const [schoolName, data] of Object.entries(stats)) {
      planesPorEscuela.push({
        schoolName,
        totalPlanes: data.totalPlanes,
        docentes: data.docentes,
        planesCompletados: data.completados,
        calidad:
          data.totalPlanes > 0
            ? Number(((data.completados / data.totalPlanes) * 100).toFixed(2))
            : 0,
      });
    }
    return {
      schools: totalSchools,
      docentes: totalDocentes,
      planes: totalPlanes,
      planesPorEscuela,
    };
  }
}
