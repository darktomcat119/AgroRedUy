import { Router } from 'express';

const router = Router();

// Search routes - TODO: Implement
router.get('/services', (_req, res) => {
  res.json({
    success: true,
    message: 'Search services - To be implemented',
    data: []
  });
});

router.get('/users', (_req, res) => {
  res.json({
    success: true,
    message: 'Search users - To be implemented',
    data: []
  });
});

export default router;
