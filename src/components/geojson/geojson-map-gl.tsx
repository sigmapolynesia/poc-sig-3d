import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import MapContainer from '../MapContainer'
import { configureMapLibreGeoJSON } from '../../utils/maplibre-utils'
import { GEOJSON_URL } from './config.ts'

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
      
      map.current.on('load', () => {
        
        if (map.current && !loader.current) {
          map.current.addControl(new maplibregl.NavigationControl());
          loadGeoJSON();
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

  const loadGeoJSON = () => {
    if (!map.current || loader.current) return;
    
    fetch(GEOJSON_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (map.current) {
          configureMapLibreGeoJSON(map.current, 'default-geojson', data);
          loader.current = true;
        }
      })
};

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }} />;
};

export default GeojsonMapGL;