import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapContainer from '../MapContainer';
import WMTSLayerSelector from './wmts-layer-selector';
import { useWMTS } from '../../hooks/useWMTS';
import { configureMapLibreWMTS, maplibreCenter } from '../../utils/maplibre-utils';

interface WMTSMapGLProps {
  center?: [number, number];
  zoom?: number;
  selectedLayer?: string;
}

const WMTSMapGL: React.FC<WMTSMapGLProps> = ({
  center = [-149.57, -17.67],
  zoom = 9.15,
  selectedLayer = 'TEFENUA:FOND'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const isMapReady = useRef(false);
  
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
      const filteredLayers = layers.filter(layer => 
        layer.title === "Fond Léger" || layer.title === "FOND Tefenua"
      );

      filteredLayers.forEach(layer => { 
        layer.title = layer.title === "FOND Tefenua" ? "Fond Tefenua" : layer.title; 
      });

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

    map.current.on('load', () => {
      isMapReady.current = true;
      
      if (layers.length > 0) {
        const layer = layers.find(l => l.identifier === currentLayer);
        if (layer) {
          configureMapLibreWMTS(map.current!, layer, WMTS_URL);
          maplibreCenter(map.current!, zoom);
        }
      }
    });

    return () => {
      isMapReady.current = false;
      map.current?.remove();
      map.current = null;
    };
  }, [center, currentLayer, layers, zoom]);

  // 2. Chargement et mise à jour de la couche WMTS
  useEffect(() => {
    if (!map.current || !isMapReady.current || layers.length === 0) return;
    
    const layer = layers.find(l => l.identifier === currentLayer);
    if (!layer) return;
    
    configureMapLibreWMTS(map.current, layer, WMTS_URL);
    maplibreCenter(map.current, zoom);
  }, [currentLayer, layers, zoom]);

  // 3. Effet pour charger la couche initiale quand les layers sont disponibles
  useEffect(() => {
    if (!map.current || !isMapReady.current || layers.length === 0) return;
    
    const layer = layers.find(l => l.identifier === currentLayer);
    if (!layer) return;
    
    configureMapLibreWMTS(map.current, layer, WMTS_URL);
    maplibreCenter(map.current, zoom);
  }, [currentLayer, layers, zoom]); 

  const reloadCurrentLayer = () => {
    if (!map.current || !isMapReady.current || layers.length === 0) return;
    
    const layer = layers.find(l => l.identifier === currentLayer);
    if (!layer) return;
    
    configureMapLibreWMTS(map.current, layer, WMTS_URL);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <WMTSLayerSelector 
          layers={layers} 
          currentLayer={currentLayer} 
          onLayerChange={setCurrentLayer} 
          onRefresh={reloadCurrentLayer} 
          loading={isLoading} 
        />
      </div>
      <MapContainer ref={mapContainer} />
    </div>
  );
};

export default WMTSMapGL;