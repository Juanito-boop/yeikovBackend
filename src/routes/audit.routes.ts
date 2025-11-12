import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { listarLogsSchema } from '../schemas/audit.schema';
import { AuditService } from '../services/audit.service';

const router = Router();
const auditService = new AuditService();

router.get('/', authenticate, validate(listarLogsSchema), async (req, res) => {
  try {
    const { entidad } = req.query;
    const logs = await auditService.listarLogs(entidad as string | undefined);
    res.status(200).json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
