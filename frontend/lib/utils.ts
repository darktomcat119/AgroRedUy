import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @description Get the full URL for an uploaded image
 * @param imagePath - The relative path from the backend (e.g., "/uploads/avatars/filename.png") or R2 public URL
 * @returns The full URL - R2 URLs are returned directly, local URLs are proxied
 */
export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '';

  // If it's a blob URL (preview during registration), use it directly - no proxy needed!
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }

  // If it's an R2 public URL (Cloudflare), use it directly - no proxy needed!
  if (imagePath.includes('r2.dev') || imagePath.includes('r2.cloudflarestorage.com')) {
    return imagePath;
  }

  // For local development uploads or other URLs, proxy them
  const target = imagePath.startsWith('http')
    ? imagePath
    : (imagePath.startsWith('/') ? imagePath : `/${imagePath}`);

  return `/api/image-proxy?url=${encodeURIComponent(target)}`;
}

