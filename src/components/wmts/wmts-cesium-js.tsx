import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import MapContainer from '../MapContainer';
import WMTSLayerSelector from './wmts-layer-selector';
import { WMTSLayer } from '../../types/wmts';
import { configureCesiumWMTS, cesiumCenter } from '../../utils/cesium-utils';

interface WMTSCesiumJSProps {
  selectedLayer?: string;
}

const WMTSCesiumJS: React.FC<WMTSCesiumJSProps> = ({
  selectedLayer = "TEFENUA:FOND"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const [currentLayer, setCurrentLayer] = useState<string>(selectedLayer);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const WMTS_URL = "https://www.tefenua.gov.pf/api/wmts";
  
  // Définition des couches disponibles
  const layers: WMTSLayer[] = [
    { 
      identifier: "TEFENUA:FOND", 
      title: "Fond Tefenua",
      format: "image/jpeg",
      tileMatrixSet: "EPSG:4326"
    },
    { 
      identifier: "TEFENUA:FOND_LEGER_v1", 
      title: "Fond Léger",
      format: "image/png8",
      tileMatrixSet: "EPSG:4326"
    },
  ];

  // 1. Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current) return;
    
    const viewer = new Cesium.Viewer(mapContainer.current, {
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: true,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      terrainProvider: new Cesium.EllipsoidTerrainProvider()
    });

    viewer.imageryLayers.removeAll();
    setViewer(viewer);

    return () => {
      viewer.destroy();
    };
  }, []);

  // 2. Chargement et mise à jour de la couche WMTS
  useEffect(() => {
    if (!viewer) return;
    setIsLoading(true);

    try {
      const layer = layers.find((l) => l.identifier === currentLayer);
      if (!layer) return;
      
      configureCesiumWMTS(viewer, layer, WMTS_URL);
      
      // 3. Zoom sur la vue par défaut
      cesiumCenter(viewer);
    } catch (error) {
      console.error("Erreur lors du chargement de la couche WMTS:", error);
    } finally {
      setIsLoading(false);
    }
  }, [viewer, currentLayer]);

  const reloadCurrentLayer = () => {
    if (!viewer) return;
    
    const layer = layers.find((l) => l.identifier === currentLayer);
    if (!layer) return;
    
    configureCesiumWMTS(viewer, layer, WMTS_URL);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
      <WMTSLayerSelector layers={layers} currentLayer={currentLayer} onLayerChange={setCurrentLayer} onRefresh={reloadCurrentLayer} loading={isLoading} />
      </div>
      <MapContainer ref={mapContainer} />
    </div>
  );
};

export default WMTSCesiumJS;