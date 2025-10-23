import { Request, Response } from 'express';
import { PrincipalService } from '../services/director.service';
import { AuthRequest } from '../middleware/auth.middleware';

const principalService = new PrincipalService();

export class DirectorController {
  async getCounts(req: AuthRequest | Request, res: Response): Promise<void> {
    try {
      const schools = await principalService.countSchools();
      const docentes = await principalService.countDocenteUsers();
      const planes = await principalService.countPlanesByDocentes();
      const planesPorEscuela = await principalService.countPlanesBySchoolForDocentes();

      res.status(200).json({
        schools,
        docentes,
        planes,
        planesPorEscuela
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
