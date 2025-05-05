import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapContainer from '../MapContainer';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const DEFAULT_GEOJSON_URL = 'https://sigmapolynesia.com/assets/test.geojson';

interface GeojsonMapGLProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  apiKey?: string;
}

const GeojsonMapGL: React.FC<GeojsonMapGLProps> = ({
  initialCenter = [-149.57, -17.67],
  initialZoom = 9.15,
  apiKey = MAPTILER_KEY
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const geojsonLoaded = useRef<boolean>(false);

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
        center: initialCenter,
        zoom: initialZoom
      });
      
      map.current.on('load', () => {
        setIsMapInitialized(true);
        
        if (map.current && !geojsonLoaded.current) {
          map.current.addControl(new maplibregl.NavigationControl());
          loadGeoJSON();
        }
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        geojsonLoaded.current = false;
      }
    };
  }, [apiKey, initialCenter, initialZoom]);

  useEffect(() => {
    if (map.current && isMapInitialized) {
      map.current.setCenter(initialCenter);
      map.current.setZoom(initialZoom);
    }
  }, [initialCenter, initialZoom, isMapInitialized]);

  const loadGeoJSON = () => {
    if (!map.current || geojsonLoaded.current) return;
    
    fetch(DEFAULT_GEOJSON_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (map.current && !map.current.getSource('default-geojson')) {
          map.current.addSource('default-geojson', {
            type: 'geojson',
            data: data
          });
          
          map.current.addLayer({
            id: 'geojson-polygons',
            type: 'fill',
            source: 'default-geojson',
            paint: {
              'fill-color': 'rgba(100, 149, 237, 0.4)',
              'fill-outline-color': '#0080ff',
            },
            filter: ['==', '$type', 'Polygon']
          });
          
          map.current.addLayer({
            id: 'geojson-polygon-outlines',
            type: 'line',
            source: 'default-geojson',
            paint: {
              'line-color': '#0080ff',
              'line-width': 2, 
            },
            filter: ['==', '$type', 'Polygon']
          });
          
          map.current.addLayer({
            id: 'geojson-lines',
            type: 'line',
            source: 'default-geojson',
            paint: {
              'line-color': '#0080ff',
              'line-width': 2
            },
            filter: ['==', '$type', 'LineString']
          });
          
          map.current.addLayer({
            id: 'geojson-points',
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
          
          geojsonLoaded.current = true;
        }
      })
  };

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }} />;
};

export default GeojsonMapGL;