import { useEffect, useRef } from 'react';
import { LAZ_URL } from './config';
import MapContainer from '../MapContainer';
import Instance from '@giro3d/giro3d/core/Instance';
import PointCloud from '@giro3d/giro3d/entities/PointCloud';
import LASSource from '@giro3d/giro3d/sources/LASSource';
import { setLazPerfPath, DEFAULT_LAZPERF_PATH } from '@giro3d/giro3d/sources/las/config';
import { Vector3, MathUtils } from 'three';
import { MapControls } from "three/examples/jsm/controls/MapControls.js";

interface LidarGiro3DProps {
  lazUrl?: string;
  lazPerfPath?: string;
  showInspector?: boolean;
}

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
    // PerspectiveCamera
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
  showInspector = true
}: LidarGiro3DProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Instance | null>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (lazPerfPath !== DEFAULT_LAZPERF_PATH) {
      setLazPerfPath(lazPerfPath);
    }
  }, [lazPerfPath]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const instance = new Instance({
      crs: 'EPSG:3857',
      target: mapContainer.current,
      backgroundColor: null,
    });

    instanceRef.current = instance;

    const loadPointCloud = async () => {
      try {
        const source = new LASSource({ url: lazUrl });
        const entity = new PointCloud({ source });

        await instance.add(entity);
        entity.setActiveAttribute('Color');
        
        placeCameraOnTop(entity.getBoundingBox(), instance);
      } catch (error) {
        console.error('Erreur lors du chargement du nuage de points:', error);
      }
    };

    loadPointCloud();

    return () => {
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, [lazUrl, showInspector]);

  return (
    <>
      <MapContainer ref={mapContainer} style={{ marginTop: '20px' }} />
      {showInspector && (
        <div 
          ref={inspectorRef}
          className="position-absolute top-0 start-0 mh-100 overflow-auto"
        />
      )}
    </>
  );
};

export default LidarGiro3D;