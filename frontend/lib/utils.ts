import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @description Get the full URL for an uploaded image
 * @param imagePath - The relative path from the backend (e.g., "/uploads/avatars/filename.png")
 * @returns The full URL including the backend server address
 */
export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '';

  // Always proxy through our same-origin endpoint to avoid next/image domain issues
  // Handles both absolute (http...) and relative (/uploads/...) inputs
  const target = imagePath.startsWith('http')
    ? imagePath
    : (imagePath.startsWith('/') ? imagePath : `/${imagePath}`);

  return `/api/image-proxy?url=${encodeURIComponent(target)}`;
}

