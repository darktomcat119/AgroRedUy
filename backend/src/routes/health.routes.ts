import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();
const healthController = new HealthController();

// GET /health
router.get('/', healthController.getHealth);

// GET /health/detailed
router.get('/detailed', healthController.getDetailedHealth);

export default router;
