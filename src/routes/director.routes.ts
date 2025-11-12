import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { DirectorController } from '../controllers/director.controller';

const router = Router();
const controller = new DirectorController();

router.get('/counts', authenticate, (req, res) => controller.getCounts(req, res));

export default router;
