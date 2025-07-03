import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import MapContainer from '../MapContainer'
import { GEOJSON_URL } from './config.ts'
import * as VectorTextProtocol from 'maplibre-gl-vector-text-protocol'

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

interface GeojsonMapGLProps {
  center?: [number, number];
  zoom?: number;
  apiKey?: string;
}

const GeojsonMapGL: React.FC<GeojsonMapGLProps> = ({
  center = [-149.57, -17.67],
  zoom = 9.15,
  apiKey = MAPTILER_KEY
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const loader = useRef<boolean>(false);

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
        center: center,
        zoom: zoom
      });

      map.current.addControl(new maplibregl.NavigationControl());

      VectorTextProtocol.addProtocols(maplibregl);
      
      // Wait for the style to load before adding source and layer
      map.current.on('load', () => {
        if (map.current) {
          map.current.addSource('default-geojson', {
            type: 'geojson',
            data: GEOJSON_URL
          });

          map.current.addLayer({
            id: 'default-geojson-1',
            type: 'fill',
            source: 'default-geojson',
            paint: {
              'fill-color': '#0080ff',
              'fill-opacity': 0.5
            },
            filter: ['==', '$type', 'Polygon']
          });

          map.current.addLayer({
            id: 'default-geojson-2',
            type: 'line',
            source: 'default-geojson',
            paint: {
              'line-color': '#0080ff',
              'line-opacity': 1
            },
            filter: ['==', '$type', 'LineString']
          });

          map.current.addLayer({
            id: 'default-geojson-3',
            type: 'circle',
            source: 'default-geojson',
            paint: {
              'circle-radius': 5,
              'circle-color': '#ff7800',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            },
            filter: ['==', '$type', 'Point']
          });
        }
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        loader.current = false;
      }
    };
  }, [apiKey, center, zoom]);

  useEffect(() => {
    if (map.current) {
      map.current.setCenter(center);
      map.current.setZoom(zoom);
    }
  }, [center, zoom]);

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }} />;
};

export default GeojsonMapGL;