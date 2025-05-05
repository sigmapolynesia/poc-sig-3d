import { useEffect, useRef } from 'react';
import MapContainer from '../MapContainer';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { configureGiro3dGeoJSON } from '../../utils/giro-utils';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const GeojsonGiro3D: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    const map = new Map({
      target: mapContainer.current,
      view: new View({
        center: fromLonLat([-149.57, -17.67]),
        zoom: 10.15
      })
    });

    configureGiro3dGeoJSON(
      'https://sigmapolynesia.com/assets/test.geojson',
      map,
      MAPTILER_KEY
    );

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }}/>;
};

export default GeojsonGiro3D;