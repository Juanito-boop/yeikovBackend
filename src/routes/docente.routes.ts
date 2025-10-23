import { Router } from 'express';
import { DocenteService } from '../services/docente.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const docenteService = new DocenteService();

// GET /api/docentes?schoolId=...
router.get('/', authenticate, async (req, res) => {
  try {
    const schoolId = req.query.schoolId as string | undefined;
    const docentes = await docenteService.getAllDocentes(schoolId);
    res.status(200).json({ docentes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
