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
  const [fileLoaded, setFileLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
      center: initialCenter,
      zoom: initialZoom
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialCenter, initialZoom, apiKey]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !map.current) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (e.target && typeof e.target.result === 'string') {
          const geoJSONcontent = JSON.parse(e.target.result);

          if (map.current?.getSource('uploaded-source')) {
            map.current.removeLayer('uploaded-polygons');
            map.current.removeSource('uploaded-source');
          }

          map.current?.addSource('uploaded-source', {
            type: 'geojson',
            data: geoJSONcontent
          });

          map.current?.addLayer({
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

          setFileLoaded(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du GeoJSON:', error);
        alert('Erreur lors du chargement du fichier GeoJSON. Vérifiez le format du fichier.');
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
      {fileLoaded && (
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'white', padding: '5px', borderRadius: '3px', zIndex: 1 }}>
          GeoJSON chargé avec succès!
        </div>
      )}
    </div>
  );
};

export default GeojsonMapGL;