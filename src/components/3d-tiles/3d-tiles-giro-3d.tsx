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
import { MathUtils, Vector3 } from 'three';
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import 'ol/ol.css';

interface DTilesGiro3DProps {
  tilesetUrl?: string;
  lazPerfPath?: string;
  showInspector?: boolean;
}

const NUKUHIVA_LON = -140.168868;
const NUKUHIVA_LAT = -8.863563;


function placeCameraOnTop(volume: import('three').Box3, instance: Instance): void {
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

const DTilesGiro3D = ({ 
  tilesetUrl = TILESET_URL,
}: DTilesGiro3DProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const extent = new Extent(
      "EPSG:3857",
      -20037508.34, 20037508.34, -20037508.34, 20037508.34
    );

    const instance = new Instance({
      target: mapContainer.current,
      crs: extent.crs,
      backgroundColor: 0x0a3b59,
    });

    const map = new Map({ extent });
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
      
      centerViewOnLocation(
        instance, 
        controls, 
        NUKUHIVA_LON, 
        NUKUHIVA_LAT, 
        10,
      );

      const pointcloud = new Tiles3D({
        url: tilesetUrl,
        errorTarget: 15,
      });

      await instance.add(pointcloud);

      const boundingBox = pointcloud.getBoundingBox();
      if (boundingBox) {
        placeCameraOnTop(boundingBox, instance);
      }
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

export default DTilesGiro3D;