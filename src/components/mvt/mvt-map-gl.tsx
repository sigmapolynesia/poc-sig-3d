import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapContainer from '../MapContainer';
import { generateTMSTileUrl } from '../../types/tms-parse.ts'

interface MVTMapGLProps {
  center?: [number, number]; 
  zoom?: number;
}

const MVTMapGL: React.FC<MVTMapGLProps> = ({
  center = [-149.55, -17.70],
  zoom = 12,
  }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const pgaLayer = {
      host: 'https://geoserver.sigmapolynesia.com',
      identifier: encodeURIComponent('PAEA:PGA')
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
      center: center,
      zoom: zoom
    });

    mapInstance.current = map;
    map.addControl(new maplibregl.NavigationControl());

    map.on('load', () => {
      map.addSource('pga-source', {
        type: 'vector',
        tiles: [generateTMSTileUrl(pgaLayer)],
        bounds: [-149.7, -17.8, -149.5, -17.6],
        minzoom: 0,
        maxzoom: 21
      });

      map.addLayer({
        id: 'pga-layer',
        type: 'fill',
        source: 'pga-source',
        'source-layer': 'pga_zone_urba_v',
        paint: {
          'fill-color': 'rgba(0, 100, 200, 0.5)',
          'fill-outline-color': 'rgba(0, 100, 200, 1)'
        },
        minzoom: 0,
        maxzoom: 22
      });
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

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(center);
      mapInstance.current.setZoom(zoom);
    }
  }, [center, zoom]);

  return (
    <MapContainer ref={mapContainer} style={{ marginTop: '20px', height: '100%', width: '100%' }} />
  );
};

export default MVTMapGL;