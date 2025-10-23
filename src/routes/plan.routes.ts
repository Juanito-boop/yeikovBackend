import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Placeholder routes for plans. Controllers not implemented yet.
// Example: GET /api/plans/:id, POST /api/plans, etc.

router.get('/', authenticate, (req, res) => {
  res.status(200).json({ message: 'Endpoint de planes - aún no implementado' });
});

export default router;
