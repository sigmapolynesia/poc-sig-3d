import { useEffect, useRef } from 'react';
import '../styles.css';
import MapContainer from '../MapContainer';

// Note: Cette implémentation est un exemple simplifié.

const MVTMapGL = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainer.current) {
      const container = mapContainer.current;
      container.innerHTML = '<div class="map-placeholder">Carte MapLibre GL JS</div>';
      container.className = 'map-container maplibre';
    }

    return () => {
      // Nettoyage
      if (mapContainer.current) {
        mapContainer.current.innerHTML = '';
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ marginTop: '20px' }} />;
};

export default MVTMapGL;