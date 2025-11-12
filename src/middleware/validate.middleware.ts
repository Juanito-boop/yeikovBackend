import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { crearPlanSchema, aprobarPlanSchema } from '../schemas/plan.schema';
import { PlanController } from '../controllers/plan.controller';

const router = Router();
const controller = new PlanController();

router.post('/', authenticate, validate(crearPlanSchema), (req, res) => controller.crear(req, res));
router.post('/:id/aprobar', authenticate, validate(aprobarPlanSchema), (req, res) => controller.aprobar(req, res));

export default router;
