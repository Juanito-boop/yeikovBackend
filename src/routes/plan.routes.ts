import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { crearPlanSchema, aprobarPlanSchema, cerrarPlanSchema } from '../schemas/plan.schema';
import { PlanController } from '../controllers/plan.controller';

const router = Router();
const controller = new PlanController();

router.post('/', authenticate, validate(crearPlanSchema), (req, res) => controller.crear(req, res));
router.get('/', authenticate, controller.listar);
router.get('/all', authenticate, controller.listar); // Debe ir antes
router.get('/mis-planes', authenticate, (req, res) => controller.listarMisPlanes(req, res)); // Planes del docente autenticado
router.get('/rechazados', authenticate, (req, res) => controller.listarPlanesRechazados(req, res)); // Planes rechazados por decano
router.get('/:id', authenticate, controller.obtener); // Debe ir después
router.put('/:id', authenticate, (req, res) => controller.actualizar(req, res)); // Actualizar plan
router.post('/:id/aprobar', authenticate, validate(aprobarPlanSchema), (req, res) => controller.aprobar(req, res));
router.post('/:id/reenviar-decano', authenticate, (req, res) => controller.reenviarADecano(req, res));
router.post('/:id/cerrar', authenticate, validate(cerrarPlanSchema), (req, res) => controller.cerrar(req, res));

export default router;
