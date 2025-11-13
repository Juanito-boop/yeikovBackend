import { Router } from 'express';
import { SchoolController } from '../controllers/schoolController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, (req, res) =>
  SchoolController.getAllSchools(req, res)
);

router.post('/', authenticate, (req, res) =>
  SchoolController.createSchool(req, res)
);

router.get('/stats/planes', authenticate, (req, res) =>
  SchoolController.getPlanesPorEscuela(req, res)
);

router.get('/:id', authenticate, (req, res) =>
  SchoolController.getSchoolById(req, res)
);

router.put('/:id', authenticate, (req, res) =>
  SchoolController.updateSchool(req, res)
);

router.delete('/:id', authenticate, (req, res) =>
  SchoolController.deleteSchool(req, res)
);

export default router;
