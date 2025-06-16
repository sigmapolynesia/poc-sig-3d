import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapContainer from './MapContainer';
import { useWMTS } from '../hooks/useWMTS';
import { DEM_URL, GEOJSON_URL, WMTS_URL } from './config-ml';
import { configureMapLibreWMTS, maplibreCenter } from '../utils/maplibre-utils';

interface LayerProps {
  center?: [number, number];
  zoom?: number;
  selectedLayer?: string;
}

const MultiLayer: React.FC<LayerProps> = ({
  center = [-149.57, -17.67],
  zoom = 9.15,
  selectedLayer = 'TEFENUA:FOND'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const { 
    layers, 
    currentLayer, 
  } = useWMTS(
    WMTS_URL, 
    selectedLayer,
  );

  // 1. Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: { version: 8, sources: {}, layers: [] },
      center,
      zoom
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl());
  }, []);

  // 2. Chargement et mise à jour de la couche WMTS
  useEffect(() => {
    if (!mapRef.current) return;
    
    const layer = layers.find(l => l.identifier === currentLayer);
    if (!layer) return;
    
    configureMapLibreWMTS(mapRef.current, layer, WMTS_URL);
    
    // 3. Zoom sur la vue par défaut
    maplibreCenter(mapRef.current, zoom);
  }, [currentLayer, layers]);

  return (
    <div>
      <MapContainer ref={mapContainer} />
    </div>
  );
};

export default MultiLayer;