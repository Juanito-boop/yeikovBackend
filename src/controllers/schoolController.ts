import { Request, Response } from 'express';
import { SchoolService } from '../services/school.service';
import { DirectorService } from '../services/director.service';

const schoolService = new SchoolService();
const directorService = new DirectorService();

export class SchoolController {
  /**
   * GET /schools
   * Lista todas las facultades.
   */
  static async getAllSchools(req: Request, res: Response): Promise<void> {
    try {
      const schools = await schoolService.getAllSchools();
      res.json(schools);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las escuelas' });
    }
  }

  /**
   * GET /schools/:id
   * Retorna una facultad con sus usuarios.
   */
  static async getSchoolById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const school = await schoolService.getSchoolById(id, true);

      if (!school) {
        res.status(404).json({ error: 'Escuela no encontrada' });
        return;
      }

      res.json(school);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la escuela' });
    }
  }

  /**
   * GET /schools/planes
   * Retorna cantidad de planes por facultad (incluye las que tienen 0).
   */
  static async getPlanesPorEscuela(req: Request, res: Response): Promise<void> {
    try {
      const data = await directorService.getCounts();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al contar planes por escuela' });
    }
  }
}
