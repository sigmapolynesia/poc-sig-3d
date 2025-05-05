import React, { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import MapContainer from '../MapContainer';
import WMTSLayerSelector from './wmts-layer-selector';
import { WMTSLayer } from '../../types/wmts';
import { configureCesiumWMTS, cesiumCenter, viewerOptions } from '../../utils/cesium-utils';

interface WMTSCesiumJSProps {
  selectedLayer?: string;
}

const WMTSCesiumJS: React.FC<WMTSCesiumJSProps> = ({
  selectedLayer = "TEFENUA:FOND"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const viewer = useRef<Cesium.Viewer | null>(null);
  const [currentLayer, setCurrentLayer] = React.useState<string>(selectedLayer);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  
  const WMTS_URL = "https://www.tefenua.gov.pf/api/wmts";
  
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

  useEffect(() => {
    if (!mapContainer.current) return;
    
    viewer.current = new Cesium.Viewer(mapContainer.current, {
      ...viewerOptions,
    });

    viewer.current.imageryLayers.removeAll();
    
    const layer = layers.find((l) => l.identifier === currentLayer);
    if (layer && viewer.current) {
      setIsLoading(true);
      try {
        configureCesiumWMTS(viewer.current, layer, WMTS_URL);
        cesiumCenter(viewer.current);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement de la couche WMTS:", error);
        setIsLoading(false);
      }
    }

    return () => {
      if (viewer.current) {
        viewer.current.destroy();
        viewer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!viewer.current) return;
    
    setIsLoading(true);
    const layer = layers.find((l) => l.identifier === currentLayer);
    
    if (layer) {
      try {
        configureCesiumWMTS(viewer.current, layer, WMTS_URL);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement de la couche WMTS:", error);
        setIsLoading(false);
      }
    }
  }, [currentLayer]);

  const reloadCurrentLayer = () => {
    if (!viewer.current) return;
    
    setIsLoading(true);
    const layer = layers.find((l) => l.identifier === currentLayer);
    
    if (layer) {
      try {
        configureCesiumWMTS(viewer.current, layer, WMTS_URL);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement de la couche WMTS:", error);
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <WMTSLayerSelector 
          layers={layers} 
          currentLayer={currentLayer} 
          onLayerChange={setCurrentLayer} 
          onRefresh={reloadCurrentLayer} 
          loading={isLoading} 
        />
      </div>
      <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default WMTSCesiumJS;