import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapContainer from '../MapContainer';
import { calculateTileCoordinates } from './tileUtils';

interface WMTSLayerOptions {
  host: string;
  identifier: string;
  style?: string;
  format: string;
  tileMatrixSet: string;
}

const generateMapLibreWMTSTileUrl = (layer: WMTSLayerOptions): string => {
  return `${layer.host}/geoserver/gwc/service/wmts/rest/${layer.identifier}/${layer.tileMatrixSet}/${layer.tileMatrixSet}:{z}/{y}/{x}?format=${layer.format}`;
};

const MVTMapGL: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
    zoom: number;
    tileX: number;
    tileY: number;
  }>({
    lat: -17.7,
    lng: -149.6,
    zoom: 12,
    tileX: 0,
    tileY: 0
  });

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const pgaLayer = {
      host: 'https://geoserver.sigmapolynesia.com',
      identifier: 'PAEA:PGA',
      style: '',
      format: 'application/vnd.mapbox-vector-tile',
      tileMatrixSet: 'EPSG:4326'
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-background',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [currentCoords.lng, currentCoords.lat],
      zoom: currentCoords.zoom
    });

    mapInstance.current = map;

    map.on('load', () => {
      map.addSource('pga-source', {
        type: 'vector',
        tiles: [generateMapLibreWMTSTileUrl(pgaLayer)],
        bounds: [-149.7, -17.8, -149.5, -17.6],
        minzoom: 0,
        maxzoom: 21
      });

      map.addLayer({
        id: 'pga-layer',
        type: 'fill',
        source: 'pga-source',
        'source-layer': 'PAEA:PGA',
        paint: {
          'fill-color': 'rgba(0, 100, 200, 0.5)',
          'fill-outline-color': 'rgba(0, 100, 200, 1)'
        },
        minzoom: 0,
        maxzoom: 22
      });
      
      updateTileCoordinates(map);
    });

    map.on('moveend', () => {
      updateTileCoordinates(map);
    });
    
    map.on('error', (e) => {
      console.error('Erreur MapLibre:', e);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const updateTileCoordinates = (map: maplibregl.Map) => {
    const center = map.getCenter();
    const zoom = Math.floor(map.getZoom());
    
    const { x, y } = calculateTileCoordinates(center.lat, center.lng, zoom);
    
    setCurrentCoords({
      lat: center.lat,
      lng: center.lng,
      zoom: zoom,
      tileX: x,
      tileY: y
    });
  };

  return (
    <div className="mvt-map-container">
      <MapContainer ref={mapContainer} style={{ marginTop: '20px', height: '100%', width: '100%' }} />
      
      <div className="p-2 bg-white border mt-2">
        <div>Center: {currentCoords.lng.toFixed(6)}, {currentCoords.lat.toFixed(6)}</div>
        <div>Zoom: {currentCoords.zoom}</div>
        <div>Tile: X={currentCoords.tileX}, Y={currentCoords.tileY}</div>
      </div>
    </div>
  );
};

export default MVTMapGL;