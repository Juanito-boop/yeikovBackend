import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));
router.get('/profile', authenticate, (req, res) => authController.getProfile(req, res));

export default router;
