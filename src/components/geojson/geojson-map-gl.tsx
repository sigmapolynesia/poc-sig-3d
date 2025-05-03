import { useEffect, useRef, useState } from 'react';
import MapContainer from '../MapContainer';
import maplibregl from 'maplibre-gl';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

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

  // Initialize map only once
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
        if (map.current) {
          map.current.addControl(new maplibregl.NavigationControl());
        }
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); 

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
        
        if (map.current.getSource('uploaded-source')) {
          if (map.current.getLayer('uploaded-polygons')) {
            map.current.removeLayer('uploaded-polygons');
          }
          map.current.removeSource('uploaded-source');
        }
        
        map.current.addSource('uploaded-source', {
          type: 'geojson',
          data: geoJSONcontent
        });

        map.current.addLayer({
          id: 'uploaded-polygons',
          type: 'fill',
          source: 'uploaded-source',
          paint: {
            'fill-color': '#888888',
            'fill-outline-color': 'red',
            'fill-opacity': 0.4
          },
          filter: ['==', '$type', 'Polygon']
        });

        map.current?.addLayer({
          id: 'uploaded-lines',
          type: 'line',
          source: 'uploaded-source',
          paint: {
            'line-color': '#0080ff',
            'line-width': 3
          },
          filter: ['==', '$type', 'LineString']
        });

        map.current?.addLayer({
          id: 'uploaded-points',
          type: 'circle',
          source: 'uploaded-source',
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