import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Brewery } from '../types';

// Leaflet Icons
const DefaultIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #f59e0b; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const ActiveIcon = L.divIcon({
  className: 'custom-div-icon-active',
  html: `<div style="background-color: #f59e0b; width: 28px; height: 28px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 20px rgba(245, 158, 11, 0.6); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

function MapSync({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface MapAreaProps {
  mapCenter: [number, number];
  filteredBreweries: Brewery[];
  selectedBrewery: Brewery | null;
  handleSelect: (b: Brewery) => void;
}

export const MapArea: React.FC<MapAreaProps> = ({
  mapCenter,
  filteredBreweries,
  selectedBrewery,
  handleSelect,
}) => {
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={mapCenter} 
        zoom={6} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        <MapSync center={mapCenter} />
        {filteredBreweries.filter(b => b.lat && b.lng).map(b => (
          <Marker 
            key={b.id} 
            position={[b.lat, b.lng]}
            icon={selectedBrewery?.id === b.id ? ActiveIcon : DefaultIcon}
            eventHandlers={{ click: () => handleSelect(b) }}
          />
        ))}
      </MapContainer>
    </div>
  );
};
