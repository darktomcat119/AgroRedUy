"use client";

import React, { useState } from "react";
import { getImageUrl } from "@/lib/utils";

interface ImageGallerySectionProps {
  images?: string[];
}

export const ImageGallerySection = ({ images = [] }: ImageGallerySectionProps): JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesPerView = 3;

  // Use provided images or show nothing if empty
  if (!images || images.length === 0) {
    return <div></div>;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : Math.max(0, images.length - imagesPerView)
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex < images.length - imagesPerView ? prevIndex + 1 : 0
    );
  };

  const visibleImages = images.slice(currentIndex, currentIndex + imagesPerView);

  return (
    <div className="flex items-center justify-start gap-4">
      {/* Previous Arrow */}
      <button 
        onClick={goToPrevious}
        className="flex items-center justify-center w-[25px] h-[25px] hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentIndex === 0 || images.length <= imagesPerView}
      >
        <img
          className="w-[25px] h-[25px] opacity-60"
          alt="Previous"
          src="/figmaAssets/molecula-icono-flecha-calendario-servicios.svg"
        />
      </button>

      {/* Image Gallery - 1:1 scale */}
      <div className="flex items-center gap-4 overflow-hidden">
        {visibleImages.map((src, index) => (
          <div
            key={`${currentIndex + index}`}
            className="w-[210px] h-[215px] rounded-[20px] overflow-hidden shadow-lg flex-shrink-0"
          >
            <img
              className="w-full h-full object-cover"
              alt={`Gallery image ${currentIndex + index + 1}`}
              src={getImageUrl(src)}
              onError={(e) => {
                // Hide broken images
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>

      {/* Next Arrow */}
      <button 
        onClick={goToNext}
        className="flex items-center justify-center w-[25px] h-[25px] hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentIndex >= images.length - imagesPerView || images.length <= imagesPerView}
      >
        <img
          className="w-[25px] h-[25px] opacity-60"
          alt="Next"
          src="/figmaAssets/molecula-icono-flecha-calendario-servicios-1.svg"
        />
      </button>
    </div>
  );
};
