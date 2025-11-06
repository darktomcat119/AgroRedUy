import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { fileService } from '../services/file.service';
import { UserService } from '../services/user.service';
import { logger } from '../config/logger';
import { prisma } from '../config/database';

const userService = new UserService();

const router = Router();

/**
 * @description Upload avatar image
 */
router.post('/avatar', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const upload = fileService.getMulterConfig().single('avatar');
    
    upload(req, res, async (err) => {
      if (err) {
        logger.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message,
          data: null
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          data: null
        });
      }

      const userId = (req as any).user.id;
      const result = await fileService.uploadAvatar(req.file, userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Failed to upload avatar',
          data: null
        });
      }

      // Update user profile with new avatar URL
      try {
        await userService.updateUser(userId, {
          profileImageUrl: result.url
        });

  return res.json({
    success: true,
          message: 'Avatar uploaded successfully',
          data: {
            url: result.url,
            filename: result.filename,
            size: result.size
          }
        });
      } catch (updateError) {
        logger.error('Error updating user profile:', updateError);
        // Clean up uploaded file if user update fails
        await fileService.deleteFile(`avatars/${result.filename}`);
        
        return res.status(500).json({
          success: false,
          message: 'Avatar uploaded but failed to update profile',
          data: null
        });
      }
    });
  } catch (error) {
    logger.error('Error in avatar upload:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

/**
 * @description Upload category icon
 */
router.post('/category-icon', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const upload = fileService.getMulterConfig().single('file');
    
    upload(req, res, async (err) => {
      if (err) {
        logger.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message,
          data: null
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          data: null
        });
      }

      const result = await fileService.uploadCategoryIcon(req.file);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Failed to upload category icon',
          data: null
        });
      }

      return res.json({
        success: true,
        message: 'Category icon uploaded successfully',
        data: {
          url: result.url,
          filename: result.filename,
          size: result.size,
          mimetype: result.mimetype
        }
      });
    });
  } catch (error) {
    logger.error('Error in category icon upload:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

/**
 * @description Upload service image
 */
router.post('/service', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const upload = fileService.getMulterConfig().single('image');
    
    upload(req, res, async (err) => {
      if (err) {
        logger.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message,
          data: null
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          data: null
        });
      }

      const serviceId = req.body.serviceId;
      const index = parseInt(req.body.index) || 0;

      if (!serviceId) {
        return res.status(400).json({
          success: false,
          message: 'Service ID is required',
          data: null
        });
      }

      const result = await fileService.uploadServiceImage(req.file, serviceId, index);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Failed to upload service image',
          data: null
        });
      }

      // Persist image record in DB so UI can fetch it later
      try {
        const created = await prisma.serviceImage.create({
          data: {
            serviceId: String(serviceId),
            imageUrl: result.url,
            sortOrder: index,
            isPrimary: index === 0
          }
        });

        return res.json({
          success: true,
          message: 'Service image uploaded successfully',
          data: {
            id: created.id,
            url: created.imageUrl,
            sortOrder: created.sortOrder,
            isPrimary: created.isPrimary
          }
        });
      } catch (dbError) {
        logger.error('Failed to create service image record:', dbError);
        // Still return upload success so UI doesn't break, but flag missing DB record
        return res.json({
          success: true,
          message: 'Service image uploaded (DB record failed)',
          data: {
            url: result.url,
            filename: result.filename,
            size: result.size
          }
        });
      }
    });
  } catch (error) {
    logger.error('Error in service image upload:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

/**
 * @description Get file information
 */
router.get('/info/:filename', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = `avatars/${filename}`;
    const info = await fileService.getFileInfo(filePath);

    if (!info.exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        data: null
      });
    }

    return res.json({
      success: true,
      message: 'File information retrieved',
      data: info
    });
  } catch (error) {
    logger.error('Error getting file info:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

/**
 * @description Delete file
 */
router.delete('/:filename', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = `avatars/${filename}`;
    const deleted = await fileService.deleteFile(filePath);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        data: null
      });
    }

    return res.json({
      success: true,
      message: 'File deleted successfully',
      data: { filename }
    });
  } catch (error) {
    logger.error('Error deleting file:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

/**
 * @description Clean up temporary files
 */
router.post('/cleanup', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Only allow admin users to clean up files
    const user = (req as any).user;
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        data: null
      });
    }

    await fileService.cleanupTempFiles();

  return res.json({
    success: true,
      message: 'Temporary files cleaned up successfully',
      data: null
    });
  } catch (error) {
    logger.error('Error cleaning up files:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

export default router;
