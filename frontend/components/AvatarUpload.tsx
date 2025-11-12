"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { fileUploadService, UploadResult } from '@/lib/fileUpload';
import { useAuth } from '@/lib/auth';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (result: UploadResult) => void;
  onFileSelect?: (file: File) => void; // New prop for file selection without upload
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  requireAuth?: boolean; // New prop to control authentication requirement
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onUpload,
  onFileSelect,
  onRemove,
  disabled = false,
  className = '',
  size = 'md',
  requireAuth = true
}) => {
  const { isAuthenticated } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      // Check authentication only if required
      if (requireAuth && !isAuthenticated) {
        throw new Error('Authentication required. Please log in to upload files.');
      }

      // Create preview
      const preview = fileUploadService.createPreviewUrl(file);
      setPreviewUrl(preview);

      if (requireAuth) {
        // Get auth token for authenticated uploads
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }

        // Upload file with authentication
        const result = await fileUploadService.uploadAvatar(file, token);
        
        if (result.success) {
          onUpload(result);
          // Clean up preview URL
          fileUploadService.revokePreviewUrl(preview);
          setPreviewUrl(null);
        } else {
          setError(result.error || 'Upload failed');
          // Clean up preview URL
          fileUploadService.revokePreviewUrl(preview);
          setPreviewUrl(null);
        }
      } else {
        // For registration, just create a preview and call onFileSelect
        const mockResult: UploadResult = {
          success: true,
          url: preview,
          filename: file.name,
          size: file.size
        };
        
        onUpload(mockResult);
        if (onFileSelect) {
          onFileSelect(file);
        }
        // Don't clean up preview URL for registration
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      // Clean up preview URL
      if (previewUrl) {
        fileUploadService.revokePreviewUrl(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading && (!requireAuth || isAuthenticated)) {
      fileInputRef.current?.click();
    } else if (requireAuth && !isAuthenticated) {
      setError('Authentication required. Please log in to upload files.');
    }
  };

  const handleRemove = () => {
    setError(null);
    setPreviewUrl(null);
    if (onRemove) {
      onRemove();
    }
  };

  const displayUrl = previewUrl || (currentAvatar ? getImageUrl(currentAvatar) : null);

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          relative rounded-full border-2 border-dashed border-gray-300
          flex items-center justify-center cursor-pointer
          hover:border-verdeprimario-100 hover:bg-gray-50
          transition-colors duration-200
          ${disabled || (requireAuth && !isAuthenticated) ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-500' : ''}
        `}
        onClick={handleClick}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar preview"
            className="absolute inset-0 w-full h-full rounded-full object-cover"
            onError={() => setError('Failed to load image')}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            {isUploading ? (
              <Loader2 className={`${iconSizes[size]} animate-spin`} />
            ) : requireAuth && !isAuthenticated ? (
              <Camera className={`${iconSizes[size]} opacity-50`} />
            ) : (
              <Camera className={iconSizes[size]} />
            )}
            <span className="text-xs mt-1">
              {isUploading ? 'Uploading...' : requireAuth && !isAuthenticated ? 'Login Required' : 'Upload'}
            </span>
          </div>
        )}

        {/* Upload overlay */}
        {!isUploading && !disabled && (!requireAuth || isAuthenticated) && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-200">
            <Upload className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
          </div>
        )}

        {/* Remove button */}
        {displayUrl && !isUploading && !disabled && (!requireAuth || isAuthenticated) && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
      )}

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading || (requireAuth && !isAuthenticated)}
      />
    </div>
  );
};
