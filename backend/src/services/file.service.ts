import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { logger } from '../config/logger';

/**
 * @fileoverview File Service - Handles file uploads and image processing
 * @description This service manages file uploads, image resizing, and file management
 * for the real estate platform, with focus on avatar uploads and image optimization.
 */

export interface UploadResult {
  success: boolean;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  error?: string;
}

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class FileService {
  private uploadDir: string;
  private maxFileSize: number;
  private allowedImageTypes: string[];

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  /**
   * @description Ensure upload directory exists
   */
  private ensureUploadDir(): void {
    const dirs = [
      this.uploadDir,
      path.join(this.uploadDir, 'avatars'),
      path.join(this.uploadDir, 'services'),
      path.join(this.uploadDir, 'temp')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created upload directory: ${dir}`);
      }
    });
  }

  /**
   * @description Configure multer for file uploads
   */
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        const uploadPath = path.join(this.uploadDir, 'temp');
        cb(null, uploadPath);
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    });

    const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (this.allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: 1
      }
    });
  }

  /**
   * @description Process and optimize uploaded image
   */
  async processImage(
    inputPath: string, 
    outputPath: string, 
    options: ImageProcessingOptions = {}
  ): Promise<void> {
    const {
      width = 400,
      height = 400,
      quality = 85,
      format = 'jpeg'
    } = options;

    try {
      await sharp(inputPath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toFormat(format)
        .toFile(outputPath);

      logger.info(`Image processed successfully: ${outputPath}`);
    } catch (error) {
      logger.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * @description Upload and process avatar image
   */
  async uploadAvatar(
    file: Express.Multer.File,
    userId: string
  ): Promise<UploadResult> {
    try {
      const tempPath = file.path;
      const ext = path.extname(file.originalname);
      const filename = `avatar-${userId}-${Date.now()}${ext}`;
      const outputPath = path.join(this.uploadDir, 'avatars', filename);
      const url = `/uploads/avatars/${filename}`;

      // Process the image (resize to 400x400)
      await this.processImage(tempPath, outputPath, {
        width: 400,
        height: 400,
        quality: 90,
        format: 'jpeg'
      });

      // Clean up temp file
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (unlinkError) {
        logger.warn('Could not delete temp file:', unlinkError);
        // Don't throw error, just log warning
      }

      return {
        success: true,
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url
      };
    } catch (error) {
      logger.error('Error uploading avatar:', error);
      
      // Clean up temp file if it exists
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          logger.warn('Could not delete temp file in error handler:', unlinkError);
        }
      }

      return {
        success: false,
        filename: '',
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * @description Upload service image
   */
  async uploadServiceImage(
    file: Express.Multer.File,
    serviceId: string,
    index: number = 0
  ): Promise<UploadResult> {
    try {
      const tempPath = file.path;
      const ext = path.extname(file.originalname);
      const filename = `service-${serviceId}-${index}-${Date.now()}${ext}`;
      const outputPath = path.join(this.uploadDir, 'services', filename);
      const url = `/uploads/services/${filename}`;

      // Process the image (resize to 800x600)
      await this.processImage(tempPath, outputPath, {
        width: 800,
        height: 600,
        quality: 85,
        format: 'jpeg'
      });

      // Clean up temp file
      fs.unlinkSync(tempPath);

      return {
        success: true,
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url
      };
    } catch (error) {
      logger.error('Error uploading service image:', error);
      
      // Clean up temp file if it exists
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        success: false,
        filename: '',
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * @description Delete file
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        logger.info(`File deleted: ${fullPath}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * @description Get file info
   */
  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    created?: Date;
    modified?: Date;
  }> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return {
          exists: true,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      }
      return { exists: false };
    } catch (error) {
      logger.error('Error getting file info:', error);
      return { exists: false };
    }
  }

  /**
   * @description Clean up old temporary files
   */
  async cleanupTempFiles(): Promise<void> {
    try {
      const tempDir = path.join(this.uploadDir, 'temp');
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        files.forEach(file => {
          const filePath = path.join(tempDir, file);
          const stats = fs.statSync(filePath);
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            logger.info(`Cleaned up old temp file: ${file}`);
          }
        });
      }
    } catch (error) {
      logger.error('Error cleaning up temp files:', error);
    }
  }
}

// Export singleton instance
export const fileService = new FileService();
