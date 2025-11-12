import { Request, Response } from 'express';
import { DirectorService } from '../services/director.service';
import { AuthRequest } from '../middleware/auth.middleware';

const directorService = new DirectorService();

export class DirectorController {
  async getCounts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await directorService.getCounts();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
