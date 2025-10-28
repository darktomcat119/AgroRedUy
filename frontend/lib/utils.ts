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
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('Image URL (already full):', imagePath);
    return imagePath;
  }
  
  // If it starts with /uploads, use the Next.js API proxy
  if (imagePath.startsWith('/uploads')) {
    // Remove the leading /uploads and use the proxy
    const relativePath = imagePath.replace('/uploads/', '');
    const proxyUrl = `/api/image-proxy/${relativePath}`;
    console.log('Image URL (proxy):', proxyUrl);
    console.log('Original path:', imagePath);
    return proxyUrl;
  }
  
  // For any other relative path, assume it's an upload path
  const proxyUrl = `/api/image-proxy/${imagePath}`;
  console.log('Image URL (proxy fallback):', proxyUrl);
  return proxyUrl;
}

