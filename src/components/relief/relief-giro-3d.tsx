import { useEffect, useRef } from 'react';
import '../styles.css';
import MapContainer from '../MapContainer';

// Note: Cette implémentation est un exemple simplifié.

const ReliefGiro3D = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainer.current) {
      const container = mapContainer.current;
      container.innerHTML = '<div class="map-placeholder">Carte Giro3D</div>';
      container.className = 'map-container giro3d';
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

export default ReliefGiro3D;