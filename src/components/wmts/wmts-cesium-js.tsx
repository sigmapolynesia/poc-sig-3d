import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import MapContainer from '../MapContainer';
import WMTSLayerSelector from './wmts-layer-selector';
import { WMTSLayer } from '../../types/wmts';

interface WMTSCesiumJSProps {
  selectedLayer?: string;
}

const WMTSCesiumJS: React.FC<WMTSCesiumJSProps> = ({
  selectedLayer = "TEFENUA:FOND"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const [currentLayer, setCurrentLayer] = useState<string>(selectedLayer);
  
  const layers: WMTSLayer[] = [
    { 
      identifier: "TEFENUA:FOND", 
      title: "FOND Tefenua",
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

  // 2. Chargement des capabilities/couches
  const loadWMTSLayer = (layerId: string) => {
    if (!viewer) return;
    
    const layer = layers.find((l) => l.identifier === layerId);
    if (!layer) return;
    
    const wmtsProvider = new Cesium.WebMapTileServiceImageryProvider({
      url: "https://www.tefenua.gov.pf/api/wmts",
      layer: layer.identifier,
      style: layer.style || "default",
      format: layer.format,
      tileMatrixSetID: layer.tileMatrixSet,
      tileMatrixLabels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
      maximumLevel: 19,
      credit: new Cesium.Credit("© Tefenua - Polynésie française")
    });

    viewer.imageryLayers.addImageryProvider(wmtsProvider);
  };

  useEffect(() => {
    if (!viewer) return;

    viewer.imageryLayers.removeAll();
    loadWMTSLayer(currentLayer);
    
    // 3. Zoom sur la vue par défaut
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-119, -33.2, 500000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0
      }
    });
  }, [viewer, currentLayer]);

  const reloadCurrentLayer = () => {
    if (viewer) {
      viewer.imageryLayers.removeAll();
      loadWMTSLayer(currentLayer);
    }
  };

  const handleLayerChange = (layerId: string) => {
    setCurrentLayer(layerId);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <WMTSLayerSelector 
          layers={layers}
          currentLayer={currentLayer}
          onLayerChange={handleLayerChange}
          onRefresh={reloadCurrentLayer}
        />
      </div>
      <MapContainer ref={mapContainer} />
    </div>
  );
};

export default WMTSCesiumJS;