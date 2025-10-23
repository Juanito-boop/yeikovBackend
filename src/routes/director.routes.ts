import { Router } from 'express';
import { DirectorController } from '../controllers/director.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const directorController = new DirectorController();

// Returns counts: number of schools and number of docente users
router.get('/counts', authenticate, (req, res) => directorController.getCounts(req, res));

export default router;
