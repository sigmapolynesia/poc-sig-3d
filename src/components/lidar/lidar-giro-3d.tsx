import { useEffect, useRef } from 'react';
import { LAZ_URL } from './config';
import MapContainer from '../MapContainer';
import Instance from '@giro3d/giro3d/core/Instance';
import Extent from "@giro3d/giro3d/core/geographic/Extent.js";
import Map from "@giro3d/giro3d/entities/Map.js";
import PointCloud from '@giro3d/giro3d/entities/PointCloud';
import LASSource from '@giro3d/giro3d/sources/LASSource';
import TiledImageSource from "@giro3d/giro3d/sources/TiledImageSource.js";
import { centerViewOnLocation } from '../../utils/giro-utils';
import XYZ from 'ol/source/XYZ';
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer.js";
import { setLazPerfPath, DEFAULT_LAZPERF_PATH } from '@giro3d/giro3d/sources/las/config';
import { Vector3, MathUtils } from 'three';
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import 'ol/ol.css';

interface LidarGiro3DProps {
  lazUrl?: string;
  lazPerfPath?: string;
  showInspector?: boolean;
}

const NUKUHIVA_LON = -140.168868;
const NUKUHIVA_LAT = -8.863563;


function placeCameraOnTop(volume: any, instance: Instance): void {
  if (!instance) {
    return;
  }

  const center = volume.getCenter(new Vector3());
  const size = volume.getSize(new Vector3());

  const camera = instance.view.camera;
  const top = volume.max.z;

  let altitude = 0;
  if ('fov' in camera && 'aspect' in camera) {
    const fov = camera.fov;
    const aspect = camera.aspect;
    const hFov = MathUtils.degToRad(fov) / 2;
    altitude = (Math.max(size.x / aspect, size.y) / Math.tan(hFov)) * 0.5;
  } else if ('top' in camera && 'bottom' in camera && 'left' in camera && 'right' in camera) {
    altitude = size.z * 2; 
  }

  instance.view.camera.position.set(center.x, center.y - 1, altitude + top);
  instance.view.camera.lookAt(center);

  const controls = new MapControls(instance.view.camera, instance.domElement);
  controls.target.copy(center);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;

  instance.view.setControls(controls);
  instance.notifyChange(instance.view.camera);
}

if (typeof window !== 'undefined') {
  setLazPerfPath(DEFAULT_LAZPERF_PATH);
}

const LidarGiro3D = ({ 
  lazUrl = LAZ_URL,
  lazPerfPath = DEFAULT_LAZPERF_PATH,
}: LidarGiro3DProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  
  useEffect(() => {
    if (lazPerfPath !== DEFAULT_LAZPERF_PATH) {
      setLazPerfPath(lazPerfPath);
    }
  }, [lazPerfPath]);

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
          NUKUHIVA_LON, 
          NUKUHIVA_LAT, 
          10,
        );

        const source = new LASSource({ url: lazUrl });
        const entity = new PointCloud({ source });

        await instance.add(entity);
        entity.setActiveAttribute('Color');
        
        placeCameraOnTop(entity.getBoundingBox(), instance);
      } catch (error) {
        console.error('Erreur lors du chargement du nuage de points:', error);
      }
    };

    initializeMap();
    mapRef.current = map;

    return () => {
      if (instance) {
        instance.dispose();
      }
    };
  }, [lazUrl]);

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }}/>;
};

export default LidarGiro3D;