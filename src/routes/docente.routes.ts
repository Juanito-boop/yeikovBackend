import { Router } from 'express';
import { DocenteService } from '../services/docente.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const docenteService = new DocenteService();

// GET /api/docentes?schoolId=...&includeInactive=true
router.get('/', authenticate, async (req, res) => {
  try {
    const schoolId = req.query.schoolId as string | undefined;
    const includeInactive = req.query.includeInactive === 'true';
    const docentes = await docenteService.getAllDocentes(schoolId, includeInactive);
    res.status(200).json({ docentes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
