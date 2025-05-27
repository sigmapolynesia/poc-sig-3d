import { useEffect, useRef } from 'react';
import '../styles.css';
import MapContainer from '../MapContainer';
import { DEM_URL } from './config';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface DEMMapGLProps {
  center?: [number, number]; 
  zoom?: number;
}

const ReliefMapGL: React.FC<DEMMapGLProps> = ({
    center = [-140.1289, -8.8732],
    zoom = 12,
  }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
      if (!mapContainer.current || mapInstance.current) return;
  
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
            },
          },
          layers: [
            {
              id: 'osm-background',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 22
            },
          ],
        },
        center: center,
        zoom: zoom
      });
  
      mapInstance.current = map;
      map.addControl(new maplibregl.NavigationControl());
  
      map.on('load', () => {
        map.addSource("terrain", {
          "type": "raster-dem",
          "url": DEM_URL,
        });

        map.addSource("hillshade", {
          "type": "raster-dem",
          "url": DEM_URL,
        });

        map.addLayer({
          "id": "hillshade",
          "type": "hillshade",
          "source": "hillshade",
          layout: {visibility: 'visible'},
          paint: {
            'hillshade-shadow-color': '#473B24',
            'hillshade-highlight-color': '#FAFAFF',
            'hillshade-accent-color': '#8B7355',
            'hillshade-illumination-direction': 315,
            'hillshade-illumination-anchor': 'viewport',
            'hillshade-exaggeration': 0.2
          }
        });

        map.setTerrain({
          source: "terrain",
          exaggeration: 1
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

export default ReliefMapGL;