"use client";

import React, { useCallback, useRef, useState } from "react";

interface ExistingImage {
  id: string;
  imageUrl: string;
}

interface MultiImageDropzoneProps {
  title?: string;
  files: File[];
  previews: string[];
  onChange: (files: File[], previews: string[]) => void;
  existing?: ExistingImage[];
  onRemoveExisting?: (imageId: string) => void;
  className?: string;
}

export function MultiImageDropzone({
  title = "Imágenes",
  files,
  previews,
  onChange,
  existing = [],
  onRemoveExisting,
  className = "",
}: MultiImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = () => inputRef.current?.click();

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      if (incoming.length === 0) return;
      const nextFiles = [...files, ...incoming];
      const nextPreviews = [
        ...previews,
        ...incoming.map((f) => URL.createObjectURL(f)),
      ];
      onChange(nextFiles, nextPreviews);
    },
    [files, previews, onChange]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeAt = (idx: number) => {
    const nextFiles = files.filter((_, i) => i !== idx);
    const nextPreviews = previews.filter((_, i) => i !== idx);
    onChange(nextFiles, nextPreviews);
  };

  return (
    <div className={className}>
      <details className="rounded-lg border border-grisprimario-10 bg-white shadow-sm">
        <summary className="cursor-pointer select-none px-4 py-3 text-negro-100 font-raleway-medium-14pt flex items-center justify-between">
          {title}
          <span className="text-xs text-grisprimario-200">(máx 10 imágenes)</span>
        </summary>
        <div className="p-4 space-y-4">
          <div
            onClick={openFilePicker}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`w-full h-28 rounded-md border-2 border-dashed flex items-center justify-center text-sm transition-colors text-grisprimario-200 hover:border-verdeprimario-100 ${
              isDragging ? "border-verdeprimario-100 bg-green-50/40" : "border-grisprimario-10 bg-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Arrastra y suelta imágenes aquí</span>
              <span className="text-grisprimario-300">o</span>
              <button type="button" className="px-3 py-1 rounded-full bg-verdeprimario-100 text-white hover:bg-verdeprimario-200" onClick={(e) => { e.preventDefault(); openFilePicker(); }}>
                Seleccionar
              </button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {(existing.length > 0 || previews.length > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {existing.map((img) => (
                <div key={img.id} className="relative w-full h-24 rounded-md overflow-hidden border border-grisprimario-10 group">
                  <img src={`/api/image-proxy?url=${encodeURIComponent(img.imageUrl)}`} alt="service-image" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  {onRemoveExisting && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRemoveExisting(img.id); }}
                      className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full px-2 text-xs text-red-600 shadow"
                      aria-label="Eliminar imagen guardada"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {previews.map((src, idx) => (
                <div key={`new-${idx}`} className="relative w-full h-24 rounded-md overflow-hidden border border-grisprimario-10 group">
                  <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeAt(idx); }}
                    className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full px-2 text-xs text-red-600 shadow"
                    aria-label="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
