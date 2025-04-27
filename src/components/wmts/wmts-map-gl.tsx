import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { WMTSLayer } from '../../types/wmts';
import { fetchWMTSCapabilities, generateWMTSTileUrl } from '../../types/wmts-parse';
import MapContainer from '../MapContainer';
import WMTSLayerSelector from './wmts-layer-selector';

interface WMTSMapGLProps {
  center?: [number, number];
  zoom?: number;
  selectedLayer?: string;
}

const WMTSMapGL: React.FC<WMTSMapGLProps> = ({
  center = [-149.57, -17.67],
  zoom = 8.5,
  selectedLayer = 'TEFENUA:FOND'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [layers, setLayers] = useState<WMTSLayer[]>([]);
  const [currentLayer, setCurrentLayer] = useState<string>(selectedLayer);

  // 1. Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: { version: 8, sources: {}, layers: [] },
      center,
      zoom
    });

    map.current.on('load', () => addWMTSLayer(currentLayer));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // 2. Chargement des capabilities/couches
  useEffect(() => {
    const loadCapabilities = async () => {
      try {
        const parsedLayers = await fetchWMTSCapabilities('https://www.tefenua.gov.pf/api/wmts');

        const filteredLayers = parsedLayers.filter(layer => 
          layer.title === "Fond Léger" || layer.title === "FOND Tefenua"
        );

        setLayers(filteredLayers);

        if (filteredLayers.length > 0 && !filteredLayers.some(l => l.identifier === currentLayer)) {
          setCurrentLayer(filteredLayers[0].identifier);
        }
      } catch (e) {
        console.error("Impossible de charger les informations du service WMTS", e);
      }
    };

    loadCapabilities();
  }, []);

  const addWMTSLayer = (layerId: string) => {
    if (!map.current || layers.length === 0) return;

    const layer = layers.find(l => l.identifier === layerId);
    if (!layer) return;

    if (map.current.getSource('wmts-source')) {
      map.current.removeLayer('wmts-layer');
      map.current.removeSource('wmts-source');
    }

    const tileUrl = generateWMTSTileUrl('https://www.tefenua.gov.pf/api/wmts', layer);

    map.current.addSource('wmts-source', {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      attribution: '© Tefenua - Polynésie française'
    });

    map.current.addLayer({
      id: 'wmts-layer',
      type: 'raster',
      source: 'wmts-source',
      layout: { visibility: 'visible' }
    });
  };

  // 3. Zoom sur la vue par défaut 
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    addWMTSLayer(currentLayer);
  }, [currentLayer, layers]);

  const reloadCurrentLayer = () => {
    if (map.current && map.current.loaded()) {
      addWMTSLayer(currentLayer);
    }
  };

  const handleLayerChange = (layerId: string) => {
    setCurrentLayer(layerId);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <WMTSLayerSelector 
          layers={layers}
          currentLayer={currentLayer}
          onLayerChange={handleLayerChange}
          onRefresh={reloadCurrentLayer}
        />
      </div>
      <MapContainer ref={mapContainer}/>
    </div>
  );
};

export default WMTSMapGL;