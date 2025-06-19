import { useEffect, useRef } from 'react';
import '../styles.css';
import MapContainer from '../MapContainer';

// Note: Cette implémentation est un exemple simplifié.

const ReliefCesiumJS = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mapContainer.current;
    if (container) {
      container.innerHTML = '<div class="map-placeholder">Carte CesiumJS</div>';
      container.className = 'map-container cesium';
    }

    return () => {
      // Nettoyage
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ marginTop: '20px' }} />;
};

export default ReliefCesiumJS;