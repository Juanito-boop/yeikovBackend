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
      res.json({ schools });
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
   * POST /schools
   * Crea una nueva facultad.
   */
  static async createSchool(req: Request, res: Response): Promise<void> {
    try {
      const { nombre } = req.body;

      if (!nombre || nombre.trim() === '') {
        res.status(400).json({ error: 'El nombre de la facultad es requerido' });
        return;
      }

      const school = await schoolService.createSchool(nombre.trim());
      res.status(201).json({
        message: 'Facultad creada exitosamente',
        ...school,
        cantidadDocentes: 0
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear la escuela' });
    }
  }

  /**
   * PUT /schools/:id
   * Actualiza una facultad.
   */
  static async updateSchool(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      if (!nombre || nombre.trim() === '') {
        res.status(400).json({ error: 'El nombre de la facultad es requerido' });
        return;
      }

      const school = await schoolService.updateSchool(id, nombre.trim());
      res.json({
        message: 'Facultad actualizada exitosamente',
        school
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar la escuela' });
    }
  }

  /**
   * DELETE /schools/:id
   * Elimina una facultad.
   */
  static async deleteSchool(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await schoolService.deleteSchool(id);
      res.json({ message: 'Facultad eliminada exitosamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar la escuela' });
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
