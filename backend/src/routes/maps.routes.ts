import { Router } from 'express';

const router = Router();

// Maps routes - TODO: Implement
router.get('/geocode', (_req, res) => {
  res.json({
    success: true,
    message: 'Geocoding - To be implemented',
    data: null
  });
});

router.get('/nearby', (_req, res) => {
  res.json({
    success: true,
    message: 'Nearby services - To be implemented',
    data: []
  });
});

export default router;
