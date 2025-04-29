import React, { useEffect, useRef } from 'react'
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import Extent from "@giro3d/giro3d/core/geographic/Extent.js";
import Instance from "@giro3d/giro3d/core/Instance.js";
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer.js";
import Map from "@giro3d/giro3d/entities/Map.js";
import WmtsSource from "@giro3d/giro3d/sources/WmtsSource.js";
import MapContainer from '../MapContainer.tsx'

// Gestion des erreurs de transformBufferInPlace
const originalConsoleError = console.error;
console.error = function(...args) {
  if (args[0] && 
      (typeof args[0] === 'string' && args[0].includes('transformBufferInPlace')) || 
      (args[0] instanceof Error && args[0].stack && args[0].stack.includes('transformBufferInPlace'))) {
    return;
  }
  
  originalConsoleError.apply(console, args);
};

const WMTSGiro3D: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  
  useEffect(() => { 
    if (!mapContainer.current) return;

    // 1. Initialisation de la carte
    const extent = new Extent(
      "EPSG:3857",
      -20037508.342789244,
      20037508.342789244,
      -20037508.342789244,
      20037508.342789244,
    );

    let instance = new Instance({
      target: mapContainer.current,
      crs: extent.crs,
      backgroundColor: 0x0a3b59,
      renderer: {
        antialias: true,
        alpha: false,  
        preserveDrawingBuffer: true
      }
    });
    
    if (!instance || !instance.domElement) {
      console.error("Failed to initialize Giro3D instance");
      return;
    }

    const map = new Map({ extent });
    instance.add(map);

    let controls = new MapControls(instance.view.camera, instance.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = true;
    controls.update();
     
    instance.view.setControls(controls);
    
    // 2. Chargement des capabilities/couches
    WmtsSource.fromCapabilities(
      "https://www.tefenua.gov.pf/api/wmts?request=GetCapabilities",
      {
        layer: "TEFENUA:FOND",
        matrixSet: "PM",
      },
    )
      .then((source) => {
        if (!source) {
          console.error("Failed to load WMTS source");
          return;
        }
        
        try {
          const colorLayer = new ColorLayer({ name: "wmts", source });
          map.addLayer(colorLayer);
          
          centerOnTahiti();
          
          instance.notifyChange(instance.view);
        } catch (err) {
          console.error("Error adding layer:", err);
        }
      })
      .catch((e) => console.error("Error loading WMTS capabilities:", e));

    // 3. Zoom sur la vue par défaut
    const centerOnTahiti = () => {
      const tahitiLon = -149.43;
      const tahitiLat = -17.67; 

      const lonMercator = tahitiLon * 20037508.34 / 180;
      const latMercator = Math.log(Math.tan((90 + tahitiLat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
      
      const zoomLevel = 250000;
      
      instance.view.camera.position.set(lonMercator, latMercator, zoomLevel);
      
      controls.target.set(lonMercator, latMercator, 0);
      controls.update();
      
      instance.notifyChange(instance.view);
    };
    
    return () => {
      // Libère les ressources lorsque le composant est démonté.
      instance.dispose()
    }

  }, []);
  
  return (
    <MapContainer ref={mapContainer} style={{ marginTop: '76px' }} />
  );
};

export default WMTSGiro3D;