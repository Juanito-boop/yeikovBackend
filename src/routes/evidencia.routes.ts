import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { subirEvidenciaSchema } from '../schemas/evidencia.schema';
import { EvidenciaController } from '../controllers/evidencia.controller';

const router = Router();
const controller = new EvidenciaController();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Tipo de archivo no permitido'));
    } else {
      cb(null, true);
    }
  },
});

router.post('/', authenticate, upload.single('file'), validate(subirEvidenciaSchema), (req, res) => controller.subir(req, res));
router.get('/accion/:accionId', authenticate, (req, res) => controller.listarPorAccion(req, res));

export default router;
