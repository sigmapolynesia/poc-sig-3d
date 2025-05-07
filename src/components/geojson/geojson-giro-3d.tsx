import { useEffect, useRef } from 'react';
import MapContainer from '../MapContainer';
import 'ol/ol.css';
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import Extent from "@giro3d/giro3d/core/geographic/Extent.js";
import Instance from "@giro3d/giro3d/core/Instance.js";
import Map from "@giro3d/giro3d/entities/Map.js";
import { configureGiro3dGeoJSON, addMapTilerBaseLayer, centerViewOnLocation } from '../../utils/giro-utils';
import { GEOJSON_URL } from './config.ts'

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const TAHITI_LAT = -17.67;
const TAHITI_LON = -149.57;

const GeojsonGiro3D: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !MAPTILER_KEY) {
      console.error("Map container ref is missing or MapTiler key is not defined");
      return;
    }
    
    const extent = new Extent(
      "EPSG:3857",
      -20037508.34, 20037508.34, -20037508.34, 20037508.34
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

    const map = new Map({ extent });
    instance.add(map);

    let controls = new MapControls(instance.view.camera, instance.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = true;
    controls.zoomToCursor = true;
    controls.update();
    instance.view.setControls(controls);

    const initializeMap = async () => {
      try {
        await addMapTilerBaseLayer(map, MAPTILER_KEY);
        
        centerViewOnLocation(
          instance, 
          controls, 
          TAHITI_LON, 
          TAHITI_LAT, 
          7.35, 
          'EPSG:4326', 
          'EPSG:3857'  
        );
        
        await configureGiro3dGeoJSON(
          GEOJSON_URL,
          map,
          MAPTILER_KEY,
          'EPSG:4326'
        );
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();
    mapRef.current = map;

    return () => {
      if (instance) {
        instance.dispose();
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }}/>;
};

export default GeojsonGiro3D;