/**
 * @fileoverview File Upload Utility - Handles file uploads to the backend
 * @description This utility manages file uploads, image preview, and validation
 * for the real estate platform, with focus on avatar uploads.
 */

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

export class FileUploadService {
  private baseUrl: string;
  private maxFileSize: number;
  private allowedTypes: string[];

  constructor() {
    // Remove /api/v1 suffix if present, since we'll add it in each method
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    this.baseUrl = apiUrl.replace(/\/api\/v1$/, '');
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  }

  /**
   * @description Validate file before upload
   */
  validateFile(file: File, options: FileUploadOptions = {}): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || this.maxFileSize;
    const allowedTypes = options.allowedTypes || this.allowedTypes;

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
      };
    }

    return { valid: true };
  }

  /**
   * @description Upload avatar image
   */
  async uploadAvatar(
    file: File, 
    token: string, 
    options: FileUploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Create form data
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload file
      const response = await fetch(`${this.baseUrl}/api/v1/files/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Upload failed'
        };
      }

      return {
        success: true,
        url: result.data.url,
        filename: result.data.filename,
        size: result.data.size
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * @description Upload category icon
   */
  async uploadCategoryIcon(file: File, options: FileUploadOptions = {}): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, {
        ...options,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
      });
      
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const formData = new FormData();
      formData.append('file', file);

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken') || '';
      
      const response = await fetch(`${this.baseUrl}/api/v1/files/category-icon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error?.message || result.error || 'Upload failed'
        };
      }

      return {
        success: true,
        url: result.data.url,
        filename: result.data.filename,
        size: result.data.size
      };
    } catch (error) {
      console.error('Error uploading category icon:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * @description Generic file upload method
   */
  async uploadFile(file: File, type: 'avatar' | 'service-image' | 'category-icon'): Promise<UploadResult> {
    switch (type) {
      case 'avatar':
        // For avatar uploads, we need to get the token from localStorage
        const token = localStorage.getItem('authToken') || '';
        return this.uploadAvatar(file, token);
      case 'service-image':
        return this.uploadServiceImage(file, 'temp-service', '', 0);
      case 'category-icon':
        return this.uploadCategoryIcon(file);
      default:
        return {
          success: false,
          error: 'Invalid upload type'
        };
    }
  }

  /**
   * @description Upload service image
   */
  async uploadServiceImage(
    file: File,
    serviceId: string,
    token: string,
    index: number = 0,
    options: FileUploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('serviceId', serviceId);
      formData.append('index', index.toString());

      // Upload file
      const response = await fetch(`${this.baseUrl}/api/v1/files/service`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Upload failed'
        };
      }

      return {
        success: true,
        url: result.data.url,
        filename: result.data.filename,
        size: result.data.size
      };
    } catch (error) {
      console.error('Error uploading service image:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * @description Delete file
   */
  async deleteFile(filename: string, token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/files/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Delete failed'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * @description Get file info
   */
  async getFileInfo(filename: string, token: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/files/info/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Failed to get file info'
        };
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  /**
   * @description Create image preview URL
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * @description Revoke preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * @description Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
