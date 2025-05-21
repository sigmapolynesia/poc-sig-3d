import { useEffect, useRef } from 'react';
import { TILESET_URL } from './config';
import MapContainer from '../MapContainer';
import Instance from '@giro3d/giro3d/core/Instance';
import Extent from "@giro3d/giro3d/core/geographic/Extent.js";
import Map from "@giro3d/giro3d/entities/Map.js";
import Tiles3D from "@giro3d/giro3d/entities/Tiles3D.js";
import TiledImageSource from "@giro3d/giro3d/sources/TiledImageSource.js";
import { centerViewOnLocation } from '../../utils/giro-utils';
import XYZ from 'ol/source/XYZ';
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer.js";
import { Vector3, Vector3Like } from 'three';
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import 'ol/ol.css';

interface LidarGiro3DProps {
  tilesetUrl?: string;
  lazPerfPath?: string;
  showInspector?: boolean;
}

const NUKUHIVA_LON = -140.168868;
const NUKUHIVA_LAT = -8.863563;

const LidarGiro3D = ({ 
  tilesetUrl = TILESET_URL,
}: LidarGiro3DProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const extent = new Extent(
      "EPSG:3857",
      -20037508.34, 20037508.34, -20037508.34, 20037508.34
    );

    let instance = new Instance({
      target: mapContainer.current,
      crs: extent.crs,
      backgroundColor: 0x0a3b59,
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

    const initializeMap = () => {
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

      map.addLayer(osmLayer).then(() => {
          centerViewOnLocation(
            instance, 
            controls, 
            NUKUHIVA_LON, 
            NUKUHIVA_LAT, 
            10,
          );
          
        const pointcloud = new Tiles3D({ url: tilesetUrl });

        function placeCamera(position: Vector3, lookAt: Vector3Like) {
          instance.view.camera.position.set(position.x, position.y, position.z);
          const lookAtVec3 = (lookAt instanceof Vector3) ? lookAt : new Vector3(lookAt.x, lookAt.y, lookAt.z);
          instance.view.camera.lookAt(lookAtVec3);

          const controls = new MapControls(instance.view.camera, instance.domElement);
          controls.target.copy(lookAtVec3);
          controls.enableDamping = true;
          controls.dampingFactor = 0.25;
          instance.view.setControls(controls);

          instance.notifyChange(instance.view.camera);
        }

        function initializeCamera() {
          const bbox = pointcloud.getBoundingBox();

          if (bbox) {
            instance.view.camera.far = 2.0 * bbox.getSize(new Vector3()).length();

            const ratio = bbox.getSize(new Vector3()).x / bbox.getSize(new Vector3()).z;
            const position = bbox.min
              .clone()
              .add(bbox.getSize(new Vector3()).multiply(new Vector3(0, 0, ratio * 0.5)));
            const lookAt = bbox.getCenter(new Vector3());
            lookAt.z = bbox.min.z;
            placeCamera(position, lookAt);
          } else {
            console.warn('La boîte englobante est null ou undefined');
          }
        }

        instance.add(pointcloud).then(() => {
          initializeCamera();
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte :', error);
    }
  };

  initializeMap();
  mapRef.current = map;

  return () => {
    if (instance) {
      instance.dispose();
    }
  };
}, [tilesetUrl]);

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }}/>;
};

export default LidarGiro3D;