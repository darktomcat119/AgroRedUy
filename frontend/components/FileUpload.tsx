"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { customToast } from '@/lib/toast';
import { fileUploadService } from '@/lib/fileUpload';

interface FileUploadProps {
  currentFile?: string;
  onUpload: (result: any) => void;
  onRemove: () => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FileUploadComponent({
  currentFile,
  onUpload,
  onRemove,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = "",
  size = 'md'
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.replace('.', ''));
    });

    if (!isValidType) {
      customToast.error(`Tipo de archivo no válido. Tipos permitidos: ${accept}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      customToast.error(`El archivo es demasiado grande. Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const result = await fileUploadService.uploadFile(file, 'category-icon');
      onUpload(result);
    } catch (error) {
      console.error('Error uploading file:', error);
      customToast.error('Error al subir archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  const isSvg = (url: string) => {
    return url.toLowerCase().endsWith('.svg');
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {currentFile ? (
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-grisprimario-10 flex items-center justify-center border-2 border-grisprimario-10`}>
            {isImage(currentFile) ? (
              <img
                src={currentFile}
                alt="Uploaded file"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const fallback = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {isSvg(currentFile) ? (
                  <FileImage className={`${iconSizes[size]} text-verdeprimario-100`} />
                ) : (
                  <File className={`${iconSizes[size]} text-verdeprimario-100`} />
                )}
              </div>
            )}
            {/* Fallback icon */}
            <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
              <FileImage className={`${iconSizes[size]} text-verdeprimario-100`} />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div
          className={`
            ${sizeClasses[size]} 
            border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${dragActive 
              ? 'border-verdeprimario-100 bg-verdeprimario-100/10' 
              : 'border-grisprimario-200 hover:border-verdeprimario-100 hover:bg-verdeprimario-100/5'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-verdeprimario-100"></div>
            ) : (
              <Upload className={`${iconSizes[size]} text-grisprimario-200`} />
            )}
            <span className="text-xs text-grisprimario-200 font-raleway-medium-12pt text-center px-2">
              {isUploading ? 'Subiendo...' : 'Arrastra o haz clic'}
            </span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />

      <div className="text-center">
        <p className="text-xs text-grisprimario-200 font-raleway-medium-12pt">
          Tipos permitidos: {accept}
        </p>
        <p className="text-xs text-grisprimario-200 font-raleway-medium-12pt">
          Tamaño máximo: {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>
    </div>
  );
}

