import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapContainer from '../MapContainer';
import WMTSLayerSelector from './wmts-layer-selector';
import { useWMTS } from '../../hooks/useWMTS';
import { configureMapLibreWMTS, maplibreCenter } from '../../utils/wmtsUtils';

interface WMTSMapGLProps {
  center?: [number, number];
  zoom?: number;
  selectedLayer?: string;
}

const WMTSMapGL: React.FC<WMTSMapGLProps> = ({
  center = [-149.57, -17.67],
  zoom = 9,
  selectedLayer = 'TEFENUA:FOND'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  
  const WMTS_URL = 'https://www.tefenua.gov.pf/api/wmts';
  
  const { 
    layers, 
    currentLayer, 
    setCurrentLayer,
    isLoading 
  } = useWMTS(
    WMTS_URL, 
    selectedLayer,
    (layers) => {
      const filteredLayers = layers.filter(layer => layer.title === "Fond Léger" || layer.title === "FOND Tefenua" );

      filteredLayers.forEach(layer => { layer.title = layer.title === "FOND Tefenua" ? "Fond Tefenua" : layer.title; });

      return filteredLayers.sort((a) => {
        if (a.title === "Fond Tefenua") return -1;
        return 0;
      });
    }
  );

  // 1. Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: { version: 8, sources: {}, layers: [] },
      center,
      zoom
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // 2. Chargement et mise à jour de la couche WMTS
  useEffect(() => {
    if (!map.current || !map.current.loaded() || layers.length === 0) return;
    
    const layer = layers.find(l => l.identifier === currentLayer);
    if (!layer) return;
    
    configureMapLibreWMTS(map.current, layer, WMTS_URL);
    
    // 3. Zoom sur la vue par défaut
    maplibreCenter(map.current, zoom);
  }, [currentLayer, layers, map.current?.loaded()]);

  const reloadCurrentLayer = () => {
    if (!map.current || !map.current.loaded() || layers.length === 0) return;
    
    const layer = layers.find(l => l.identifier === currentLayer);
    if (!layer) return;
    
    configureMapLibreWMTS(map.current, layer, WMTS_URL);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <WMTSLayerSelector layers={layers} currentLayer={currentLayer} onLayerChange={setCurrentLayer} onRefresh={reloadCurrentLayer} loading={isLoading} />
      </div>
      <MapContainer ref={mapContainer} />
    </div>
  );
};

export default WMTSMapGL;