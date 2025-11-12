import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
  private storageType: 'local' | 's3';
  private s3Client?: S3Client;
  private r2BucketName?: string;
  private r2PublicUrl?: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.storageType = (process.env.STORAGE_TYPE || 'local') as 'local' | 's3';
    
    // Initialize S3/R2 client if needed
    if (this.storageType === 's3') {
      this.initializeS3Client();
    }
    
    // Ensure upload directory exists (needed for temp files even with S3)
    this.ensureUploadDir();
  }

  /**
   * @description Initialize S3/R2 client for cloud storage
   */
  private initializeS3Client(): void {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const endpoint = process.env.R2_ENDPOINT;
    const region = process.env.AWS_REGION || 'auto';

    this.r2BucketName = process.env.R2_BUCKET_NAME || process.env.AWS_S3_BUCKET;
    this.r2PublicUrl = process.env.R2_PUBLIC_URL; // Optional - will use default R2 URL if not provided

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 R2 CLIENT INITIALIZATION DEBUG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Access Key ID:', accessKeyId ? `${accessKeyId.substring(0, 8)}...` : 'NOT SET');
    console.log('Secret Key:', secretAccessKey ? `${secretAccessKey.substring(0, 8)}...` : 'NOT SET');
    console.log('Endpoint:', endpoint || 'NOT SET');
    console.log('Region:', region);
    console.log('Bucket Name:', this.r2BucketName || 'NOT SET');
    console.log('Public URL:', this.r2PublicUrl || 'NOT SET');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!accessKeyId || !secretAccessKey || !this.r2BucketName) {
      logger.error('Missing required S3/R2 configuration. Check your environment variables.');
      throw new Error('S3/R2 configuration incomplete. Required: ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME');
    }

    if (!endpoint) {
      logger.warn('R2_ENDPOINT not provided. Make sure to set R2_PUBLIC_URL for file access or enable public access on your R2 bucket.');
    }

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    logger.info(`Initialized ${endpoint ? 'Cloudflare R2' : 'AWS S3'} client. Public URL: ${this.r2PublicUrl || 'using bucket default'}`);
  }

  /**
   * @description Ensure upload directory exists
   */
  private ensureUploadDir(): void {
    const dirs = [
      this.uploadDir,
      path.join(this.uploadDir, 'avatars'),
      path.join(this.uploadDir, 'services'),
      path.join(this.uploadDir, 'category-icons'),
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
   * @description Upload file to S3/R2
   * Note: Upload succeeds regardless of R2_PUBLIC_URL setting.
   * R2_PUBLIC_URL is only used to generate the public access URL returned in the response.
   */
  private async uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<string> {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 R2 UPLOAD DEBUG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Upload Key:', key);
    console.log('Content Type:', contentType);
    console.log('Buffer Size:', buffer.length, 'bytes');
    console.log('Bucket Name:', this.r2BucketName);
    console.log('S3 Client Initialized:', !!this.s3Client);
    
    if (!this.s3Client || !this.r2BucketName) {
      console.log('❌ ERROR: S3 client not initialized');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      throw new Error('S3 client not initialized');
    }

    // Upload to R2/S3
    const command = new PutObjectCommand({
      Bucket: this.r2BucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    console.log('📤 Sending upload command to R2...');
    
    try {
      const response = await this.s3Client.send(command);
      console.log('✅ Upload successful!');
      console.log('Response:', JSON.stringify(response, null, 2));
    } catch (error: any) {
      console.log('❌ UPLOAD FAILED!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Error Name:', error.name);
      console.log('Error Message:', error.message);
      console.log('Error Code:', error.Code || error.$metadata?.httpStatusCode);
      console.log('HTTP Status:', error.$metadata?.httpStatusCode);
      console.log('Request ID:', error.$metadata?.requestId);
      console.log('Full Error:', JSON.stringify(error, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      throw error;
    }
    
    // Return public URL
    if (this.r2PublicUrl) {
      const publicUrl = `${this.r2PublicUrl}/${key}`;
      console.log('📍 Public URL:', publicUrl);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      // Use custom domain if provided
      return publicUrl;
    }
    
    // If no custom domain, you'll need to:
    // 1. Enable "Public Access" on your R2 bucket in Cloudflare dashboard
    // 2. Cloudflare will provide a r2.dev URL (e.g., https://pub-xxxxx.r2.dev)
    // 3. Set that URL as R2_PUBLIC_URL in your .env
    logger.warn(`R2_PUBLIC_URL not set. File uploaded to ${key} but public URL cannot be generated. Enable public access in R2 dashboard and set R2_PUBLIC_URL.`);
    console.log('⚠️  Warning: R2_PUBLIC_URL not set');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Return a placeholder - file is uploaded but URL needs to be configured
    return `r2://${this.r2BucketName}/${key}`;
  }

  /**
   * @description Upload and process avatar image
   */
  async uploadAvatar(
    file: Express.Multer.File,
    userId: string
  ): Promise<UploadResult> {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  📸 AVATAR UPLOAD STARTED              ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('User ID:', userId);
    console.log('Original Filename:', file.originalname);
    console.log('File Size:', file.size, 'bytes');
    console.log('Mimetype:', file.mimetype);
    console.log('Storage Type:', this.storageType);
    console.log('════════════════════════════════════════\n');
    
    let tempPath = file.path;
    const filename = `avatar-${userId}-${Date.now()}.jpg`; // Always use .jpg after processing
    
    try {
      // Process the image (resize to 400x400)
      const processedPath = path.join(this.uploadDir, 'temp', `processed-${filename}`);
      console.log('🔄 Processing image...');
      await this.processImage(tempPath, processedPath, {
        width: 400,
        height: 400,
        quality: 90,
        format: 'jpeg'
      });
      console.log('✅ Image processed successfully\n');

      let url: string;

      if (this.storageType === 's3') {
        console.log('📤 Using S3/R2 storage...');
        // Upload to R2/S3
        const buffer = await fs.promises.readFile(processedPath);
        const key = `avatars/${filename}`;
        url = await this.uploadToS3(buffer, key, 'image/jpeg');
        
        // Clean up processed file
        try {
          if (fs.existsSync(processedPath)) {
            fs.unlinkSync(processedPath);
          }
        } catch (unlinkError) {
          logger.warn('Could not delete processed file:', unlinkError);
        }
      } else {
        // Local storage
        const outputPath = path.join(this.uploadDir, 'avatars', filename);
        await fs.promises.rename(processedPath, outputPath);
        url = `${process.env.API_URL || 'http://localhost:3003'}/uploads/avatars/${filename}`;
      }

      // Clean up temp file
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (unlinkError) {
        logger.warn('Could not delete temp file:', unlinkError);
      }

      logger.info(`Avatar uploaded successfully: ${filename} (${this.storageType})`);

      return {
        success: true,
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: 'image/jpeg',
        url
      };
    } catch (error) {
      logger.error('Error uploading avatar:', error);
      
      // Clean up temp files if they exist
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        const processedPath = path.join(this.uploadDir, 'temp', `processed-${filename}`);
        if (fs.existsSync(processedPath)) {
          fs.unlinkSync(processedPath);
        }
      } catch (unlinkError) {
        logger.warn('Could not delete temp files in error handler:', unlinkError);
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
   * @description Upload and process category icon
   */
  async uploadCategoryIcon(
    file: Express.Multer.File
  ): Promise<UploadResult> {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  🏷️  CATEGORY ICON UPLOAD STARTED     ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('Original Filename:', file.originalname);
    console.log('File Size:', file.size, 'bytes');
    console.log('Mimetype:', file.mimetype);
    console.log('Storage Type:', this.storageType);
    console.log('════════════════════════════════════════\n');
    
    let tempPath = file.path;
    const ext = path.extname(file.originalname);
    const filename = ext.toLowerCase() === '.svg' 
      ? `category-icon-${Date.now()}${ext}`
      : `category-icon-${Date.now()}.png`;
    
    try {
      let url: string;

      // Check if it's an SVG file
      if (ext.toLowerCase() === '.svg') {
        console.log('📄 SVG file detected - uploading without processing...');
        // For SVG files, just copy/upload without processing
        if (this.storageType === 's3') {
          const buffer = await fs.promises.readFile(tempPath);
          const key = `category-icons/${filename}`;
          url = await this.uploadToS3(buffer, key, 'image/svg+xml');
        } else {
          const outputPath = path.join(this.uploadDir, 'category-icons', filename);
          await fs.promises.copyFile(tempPath, outputPath);
          url = `${process.env.API_URL || 'http://localhost:3003'}/uploads/category-icons/${filename}`;
        }
      } else {
        // Process other image types (resize to 128x128 for icons)
        console.log('🔄 Processing icon image (128x128)...');
        const processedPath = path.join(this.uploadDir, 'temp', `processed-${filename}`);
        await this.processImage(tempPath, processedPath, {
          width: 128,
          height: 128,
          quality: 90,
          format: 'png'
        });
        console.log('✅ Icon processed successfully\n');

        if (this.storageType === 's3') {
          console.log('📤 Using S3/R2 storage for category icon...');
          // Upload to R2/S3
          const buffer = await fs.promises.readFile(processedPath);
          const key = `category-icons/${filename}`;
          url = await this.uploadToS3(buffer, key, 'image/png');
          
          // Clean up processed file
          try {
            if (fs.existsSync(processedPath)) {
              fs.unlinkSync(processedPath);
            }
          } catch (unlinkError) {
            logger.warn('Could not delete processed file:', unlinkError);
          }
        } else {
          // Local storage
          const outputPath = path.join(this.uploadDir, 'category-icons', filename);
          await fs.promises.rename(processedPath, outputPath);
          url = `${process.env.API_URL || 'http://localhost:3003'}/uploads/category-icons/${filename}`;
        }
      }

      // Clean up temp file
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (unlinkError) {
        logger.warn('Could not delete temp file:', unlinkError);
      }

      logger.info(`Category icon uploaded successfully: ${filename} (${this.storageType})`);

      return {
        success: true,
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: ext.toLowerCase() === '.svg' ? 'image/svg+xml' : 'image/png',
        url
      };
    } catch (error) {
      logger.error('Error uploading category icon:', error);
      
      // Clean up temp files if they exist
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        const processedPath = path.join(this.uploadDir, 'temp', `processed-${filename}`);
        if (fs.existsSync(processedPath)) {
          fs.unlinkSync(processedPath);
        }
      } catch (unlinkError) {
        logger.warn('Could not delete temp files:', unlinkError);
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
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  🖼️  SERVICE IMAGE UPLOAD STARTED     ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('Service ID:', serviceId);
    console.log('Image Index:', index);
    console.log('Original Filename:', file.originalname);
    console.log('File Size:', file.size, 'bytes');
    console.log('Mimetype:', file.mimetype);
    console.log('Storage Type:', this.storageType);
    console.log('════════════════════════════════════════\n');
    
    let tempPath = file.path;
    const filename = `service-${serviceId}-${index}-${Date.now()}.jpg`; // Always use .jpg after processing
    
    try {
      // Process the image (resize to 800x600)
      console.log('🔄 Processing service image (800x600)...');
      const processedPath = path.join(this.uploadDir, 'temp', `processed-${filename}`);
      await this.processImage(tempPath, processedPath, {
        width: 800,
        height: 600,
        quality: 85,
        format: 'jpeg'
      });
      console.log('✅ Service image processed successfully\n');

      let url: string;

      if (this.storageType === 's3') {
        console.log('📤 Using S3/R2 storage for service image...');
        // Upload to R2/S3
        const buffer = await fs.promises.readFile(processedPath);
        const key = `services/${filename}`;
        url = await this.uploadToS3(buffer, key, 'image/jpeg');
        
        // Clean up processed file
        try {
          if (fs.existsSync(processedPath)) {
            fs.unlinkSync(processedPath);
          }
        } catch (unlinkError) {
          logger.warn('Could not delete processed file:', unlinkError);
        }
      } else {
        // Local storage
        const outputPath = path.join(this.uploadDir, 'services', filename);
        await fs.promises.rename(processedPath, outputPath);
        url = `${process.env.API_URL || 'http://localhost:3003'}/uploads/services/${filename}`;
      }

      // Clean up temp file
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (unlinkError) {
        logger.warn('Could not delete temp file:', unlinkError);
      }

      logger.info(`Service image uploaded successfully: ${filename} (${this.storageType})`);

      return {
        success: true,
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: 'image/jpeg',
        url
      };
    } catch (error) {
      logger.error('Error uploading service image:', error);
      
      // Clean up temp files if they exist
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        const processedPath = path.join(this.uploadDir, 'temp', `processed-${filename}`);
        if (fs.existsSync(processedPath)) {
          fs.unlinkSync(processedPath);
        }
      } catch (unlinkError) {
        logger.warn('Could not delete temp files:', unlinkError);
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
