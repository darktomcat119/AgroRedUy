import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @description Check storage configuration (debug endpoint)
 * Remove this in production or protect with admin auth
 */
router.get('/storage-config', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  
  // Only allow SUPERADMIN to see this info
  if (user.role !== 'SUPERADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const config = {
    storageType: process.env.STORAGE_TYPE || 'not set',
    r2Configured: {
      accessKeyId: !!process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: !!process.env.R2_SECRET_ACCESS_KEY,
      bucketName: process.env.R2_BUCKET_NAME || 'not set',
      endpoint: process.env.R2_ENDPOINT || 'not set',
      publicUrl: process.env.R2_PUBLIC_URL || 'not set',
    },
    nodeEnv: process.env.NODE_ENV,
    redisConfigured: !!process.env.REDIS_URL,
  };

  return res.json({
    success: true,
    data: config
  });
});

export default router;

