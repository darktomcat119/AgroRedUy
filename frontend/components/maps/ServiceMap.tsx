"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Map, Marker } from 'pigeon-maps';

interface ServiceMapProps {
  initialLat?: number;
  initialLng?: number;
  zoom?: number;
  height?: number;
  className?: string;
  onPositionChange?: (lat: number, lng: number) => void;
  onZoomChange?: (zoom: number) => void;
}

export function ServiceMap({
  initialLat = -32.5228,
  initialLng = -55.7658,
  zoom = 6,
  height = 300,
  className = '',
  onPositionChange,
  onZoomChange,
}: ServiceMapProps) {
  const [position, setPosition] = useState<[number, number]>([
    Number(initialLat),
    Number(initialLng),
  ]);
  const [currentZoom, setCurrentZoom] = useState<number>(Number(zoom) || 6);

  useEffect(() => {
    setPosition([Number(initialLat), Number(initialLng)]);
  }, [initialLat, initialLng]);

  const center = useMemo(() => position, [position]);

  return (
    <div className={className} style={{ width: '100%', height }}>
      <Map
        height={height}
        center={center}
        defaultCenter={center}
        defaultZoom={currentZoom}
        onBoundsChanged={({ zoom: z }: { zoom: number }) => {
          const zNum = Number(z);
          if (!isNaN(zNum) && zNum !== currentZoom) {
            setCurrentZoom(zNum);
            if (onZoomChange) onZoomChange(zNum);
          }
        }}
        onClick={({ latLng }: { latLng: [number, number] }) => {
          const [lat, lng] = latLng as [number, number];
          if (lat !== position[0] || lng !== position[1]) {
            setPosition([lat, lng]);
            if (onPositionChange) onPositionChange(lat, lng);
          }
        }}
      >
        <Marker anchor={center} width={40} />
      </Map>
    </div>
  );
}

export default ServiceMap;


