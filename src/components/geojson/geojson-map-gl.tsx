import { useEffect, useRef, useState } from 'react';
import MapContainer from '../MapContainer';
import maplibregl from 'maplibre-gl';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const DEFAULT_GEOJSON_URL = 'https://sigmapolynesia.com/assets/test.geojson';

interface GeojsonMapGLProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  apiKey?: string;
}

const GeojsonMapGL = ({
  initialCenter = [-149.43, -17.67],
  initialZoom = 8,
  apiKey = MAPTILER_KEY
}: GeojsonMapGLProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Initialize the map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
        center: initialCenter,
        zoom: initialZoom
      });
      
      map.current.on('load', () => {
        console.log('Map initialized, loading GeoJSON');
        setIsMapInitialized(true);
        
        if (map.current) {
          map.current.addControl(new maplibregl.NavigationControl());
          
          fetch(DEFAULT_GEOJSON_URL)
            .then(response => {
              console.log('GeoJSON fetch response:', response.status);
              if (!response.ok) {
                throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              console.log('GeoJSON data loaded:', data);
              
              map.current!.addSource('default-geojson', {
                type: 'geojson',
                data: data
              });
              
              map.current!.addLayer({
                id: 'geojson-polygons',
                type: 'fill',
                source: 'default-geojson',
                paint: {
                  'fill-color': '#888888',
                  'fill-outline-color': 'red',
                  'fill-opacity': 0.4
                },
                filter: ['==', '$type', 'Polygon']
              });
              
              map.current!.addLayer({
                id: 'geojson-lines',
                type: 'line',
                source: 'default-geojson',
                paint: {
                  'line-color': '#0080ff',
                  'line-width': 3
                },
                filter: ['==', '$type', 'LineString']
              });
              
              map.current!.addLayer({
                id: 'geojson-points',
                type: 'circle',
                source: 'default-geojson',
                paint: {
                  'circle-radius': 6,
                  'circle-color': '#ff7800',
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff'
                },
                filter: ['==', '$type', 'Point']
              });
            
            })
            .catch(error => {
              console.error('Error loading GeoJSON from URL:', error);
            });
        }
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [apiKey, initialCenter, initialZoom]);

  useEffect(() => {
    if (map.current && isMapInitialized) {
      map.current.setCenter(initialCenter);
      map.current.setZoom(initialZoom);
    }
  }, [initialCenter, initialZoom, isMapInitialized]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !map.current) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result || !map.current) return;
      
      try {
        const geoJSONcontent = JSON.parse(e.target.result as string);
        
        for (const layerId of ['geojson-polygons', 'geojson-lines', 'geojson-points']) {
          if (map.current.getLayer(layerId)) {
            map.current.removeLayer(layerId);
          }
        }
        
        if (map.current.getSource('default-geojson')) {
          map.current.removeSource('default-geojson');
        }
        
        map.current.addSource('default-geojson', {
          type: 'geojson',
          data: geoJSONcontent
        });
        
        map.current.addLayer({
          id: 'geojson-polygons',
          type: 'fill',
          source: 'default-geojson',
          paint: {
            'fill-color': '#888888',
            'fill-outline-color': 'red',
            'fill-opacity': 0.4
          },
          filter: ['==', '$type', 'Polygon']
        });
        
        map.current.addLayer({
          id: 'geojson-lines',
          type: 'line',
          source: 'default-geojson',
          paint: {
            'line-color': '#0080ff',
            'line-width': 3
          },
          filter: ['==', '$type', 'LineString']
        });
        
        map.current.addLayer({
          id: 'geojson-points',
          type: 'circle',
          source: 'default-geojson',
          paint: {
            'circle-radius': 6,
            'circle-color': '#ff7800',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          },
          filter: ['==', '$type', 'Point']
        });
      } catch (error) {
        console.error('Error parsing GeoJSON:', error);
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }} />
      <input
        type="file"
        id="file"
        name="file"
        accept="application/geo+json,application/vnd.geo+json,.geojson"
        onChange={handleFileSelect}
        style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}
      />
    </div>
  );
};

export default GeojsonMapGL;