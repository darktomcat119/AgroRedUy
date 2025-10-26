"use client";

import React, { useState } from "react";

const galleryImages = [
  "/figmaAssets/atomo-foto-1.png",
  "/figmaAssets/atomo-foto-2.png", 
  "/figmaAssets/atomo-foto-3.png",
  "/figmaAssets/atomo-foto-4.png",
  "/figmaAssets/atomo-foto-5.png",
];

export const ImageGallerySection = (): JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesPerView = 3;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : Math.max(0, galleryImages.length - imagesPerView)
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex < galleryImages.length - imagesPerView ? prevIndex + 1 : 0
    );
  };

  const visibleImages = galleryImages.slice(currentIndex, currentIndex + imagesPerView);

  return (
    <div className="flex items-center justify-start gap-4">
      {/* Previous Arrow */}
      <button 
        onClick={goToPrevious}
        className="flex items-center justify-center w-[25px] h-[25px] hover:opacity-80 transition-opacity cursor-pointer"
        disabled={currentIndex === 0}
      >
        <img
          className={`w-[25px] h-[25px] ${currentIndex === 0 ? 'opacity-40' : 'opacity-60'}`}
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
              src={src}
            />
          </div>
        ))}
      </div>

      {/* Next Arrow */}
      <button 
        onClick={goToNext}
        className="flex items-center justify-center w-[25px] h-[25px] hover:opacity-80 transition-opacity cursor-pointer"
        disabled={currentIndex >= galleryImages.length - imagesPerView}
      >
        <img
          className={`w-[25px] h-[25px] ${currentIndex >= galleryImages.length - imagesPerView ? 'opacity-40' : 'opacity-60'}`}
          alt="Next"
          src="/figmaAssets/molecula-icono-flecha-calendario-servicios-1.svg"
        />
      </button>
    </div>
  );
};
