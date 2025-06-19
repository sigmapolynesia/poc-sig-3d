import { useEffect, useRef } from 'react';
import '../styles.css';
import MapContainer from '../MapContainer';
import { DEM_URL } from './config';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

interface DEMMapGLProps {
  center?: [number, number]; 
  zoom?: number;
  apiKey?: string;
}

const ReliefMapGL: React.FC<DEMMapGLProps> = ({
    center = [-140.1289, -8.8732],
    zoom = 12,
    apiKey = MAPTILER_KEY,
  }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
      if (!mapContainer.current || mapInstance.current) return;
  
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`,
        center: center,
        zoom: zoom,
        pitch: 60,
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
            'hillshade-exaggeration': 0.35
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
    }, [apiKey, center, zoom]);
  
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