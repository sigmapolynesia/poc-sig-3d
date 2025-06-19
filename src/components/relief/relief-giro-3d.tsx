import { useEffect, useRef } from 'react';
import MapContainer from '../MapContainer';
import 'ol/ol.css';
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import Extent from "@giro3d/giro3d/core/geographic/Extent.js";
import Instance from "@giro3d/giro3d/core/Instance.js";
import Map from "@giro3d/giro3d/entities/Map.js";
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer.js";
import ElevationLayer from "@giro3d/giro3d/core/layer/ElevationLayer.js";
import TiledImageSource from "@giro3d/giro3d/sources/TiledImageSource.js";
import MapboxTerrainFormat from "@giro3d/giro3d/formats/MapboxTerrainFormat.js";
import XYZ from 'ol/source/XYZ';
import { centerViewOnLocation } from '../../utils/giro-utils';
import { TILE_URL } from './config';
import { transformExtent } from 'ol/proj';
import { MapLightingMode } from "@giro3d/giro3d/entities/MapLightingOptions.js";


const TILE_BOUNDS = [-140.2522, -8.9659, -140.0056, -8.7805];
const TILE_CENTER = [-140.1289, -8.8732, 10]; 

const ReliefGiro3D: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) {
      console.error("Map container ref is missing");
      return;
    }
    
    const boundsWebMercator = transformExtent(TILE_BOUNDS, 'EPSG:4326', 'EPSG:3857');
    console.log('Bounds in Web Mercator:', boundsWebMercator);
    
    const extent = new Extent(
      "EPSG:3857",
      boundsWebMercator[0], boundsWebMercator[2], boundsWebMercator[1], boundsWebMercator[3]
    );

    const instance = new Instance({
      target: mapContainer.current,
      crs: extent.crs,
      backgroundColor: 0x0a3b59,
      renderer: {
        antialias: true,
        alpha: false,  
        preserveDrawingBuffer: true
      }
    });

    const map = new Map({ 
      extent,
      lighting: {
        enabled: true,
        mode: MapLightingMode.Hillshade,
      },
    });
    instance.add(map);

    const controls = new MapControls(instance.view.camera, instance.domElement);
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
        console.log('OSM layer added successfully');

        console.log('Adding elevation layer with URL:', TILE_URL);

        const elevationSource = new TiledImageSource({
          format: new MapboxTerrainFormat(),
          source: new XYZ({
            url: TILE_URL,
            projection: 'EPSG:3857',
            crossOrigin: "anonymous",
            minZoom: 6,  
            maxZoom: 18, 
            tileSize: 256, 
          }),
        });

        const elevationLayer = new ElevationLayer({
          name: "nuku-hiva-elevation",
          extent, 
          source: elevationSource,
        });

        await map.addLayer(elevationLayer);
        console.log('Elevation layer added successfully');
        
        centerViewOnLocation(
          instance, 
          controls, 
          TILE_CENTER[0],
          TILE_CENTER[1], 
          TILE_CENTER[2], 
        );

        instance.notifyChange();

      } catch (error) {
        console.error('Error initializing map:', error);
        
        try {
          const osmSource = new TiledImageSource({
            source: new XYZ({
              url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              crossOrigin: 'anonymous',
            })
          });

          const osmLayer = new ColorLayer({
            name: 'osm-fallback',
            source: osmSource,
            extent: map.extent,
          });

          await map.addLayer(osmLayer);
          
          centerViewOnLocation(
            instance, 
            controls, 
            TILE_CENTER[0], 
            TILE_CENTER[1], 
            10, 
          );
          
          instance.notifyChange();
          console.log('Fallback to OSM only');
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
        }
      }
    };

    initializeMap();
    mapRef.current = map;

    return () => {
      if (instance) {
        try {
          instance.dispose();
        } catch (error) {
          console.error('Error disposing instance:', error);
        }
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }}/>;
};

export default ReliefGiro3D;