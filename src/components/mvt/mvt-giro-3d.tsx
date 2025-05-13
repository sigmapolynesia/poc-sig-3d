import { useEffect, useRef } from 'react';
import MapContainer from '../MapContainer';
import 'ol/ol.css';
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import Extent from "@giro3d/giro3d/core/geographic/Extent.js";
import Instance from "@giro3d/giro3d/core/Instance.js";
import Map from "@giro3d/giro3d/entities/Map.js";
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer.js";
import VectorTileSource from "@giro3d/giro3d/sources/VectorTileSource.js";
import TiledImageSource from "@giro3d/giro3d/sources/TiledImageSource.js";
import XYZ from 'ol/source/XYZ';
import { createMVTStyle,centerViewOnLocation } from '../../utils/giro-utils';
import { generateTMSTileUrl } from '../../types/tms-parse.ts'

const TAHITI_LAT = -17.70;
const TAHITI_LON = -149.55;

const MVTGiro3D: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) {
      console.error("Map container ref is missing");
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
        const osmSource = new TiledImageSource({
          source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            crossOrigin: 'anonymous',
          })
        });

        const osmLayer = new ColorLayer({
          name: 'osm',
          source: osmSource,
          extent: map.extent,
        });

        await map.addLayer(osmLayer);
        
        centerViewOnLocation(
          instance, 
          controls, 
          TAHITI_LON, 
          TAHITI_LAT, 
          10,
        );

        const pgaLayer = {
          host: 'https://geoserver.sigmapolynesia.com',
          identifier: encodeURIComponent('PAEA:PGA')
        };
        
        const vectorTileSource = new VectorTileSource({
          url: generateTMSTileUrl(pgaLayer),
          style: createMVTStyle()
        });

        const vectorTileLayer = new ColorLayer({
          name: 'mvt-layer',
          source: vectorTileSource,
          extent: map.extent,
        });

        await map.addLayer(vectorTileLayer);
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

export default MVTGiro3D;