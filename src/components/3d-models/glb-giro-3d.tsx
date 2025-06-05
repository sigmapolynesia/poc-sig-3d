import { useEffect, useRef } from 'react';
import { HemisphereLight, Mesh, MeshStandardMaterial, Vector3, Box3 } from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Instance from "@giro3d/giro3d/core/Instance.js";
import Extent from "@giro3d/giro3d/core/geographic/Extent.js";
import Map from "@giro3d/giro3d/entities/Map.js";
import TiledImageSource from "@giro3d/giro3d/sources/TiledImageSource.js";
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer.js";
import XYZ from 'ol/source/XYZ';
import { transform } from 'ol/proj';
import MapContainer from '../MapContainer';
import { GLB_URL } from './config';

interface GLBGiro3DProps {
  modelUrl?: string;
  modelPosition?: [number, number, number];
  modelRotation?: [number, number, number];
  modelScale?: number;
}

const GLBGiro3D: React.FC<GLBGiro3DProps> = ({
  modelUrl = GLB_URL,
  modelPosition = [-140.168868, -8.863563, 0], 
  modelRotation = [Math.PI / 2, 0, 0],
  modelScale = 1
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Instance | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    let instance: Instance | null = null;
    let isDestroyed = false;

    const initializeScene = async () => {
      try {

        const extent = new Extent(
          "EPSG:3857",
          -20037508.34, 20037508.34, -20037508.34, 20037508.34
        );

        instance = new Instance({
          target: mapContainer.current!,
          crs: extent.crs,
          backgroundColor: 0x87CEEB,
          renderer: {
            antialias: false, 
            alpha: false,
            preserveDrawingBuffer: false, 
            powerPreference: "default",
            stencil: false,
            depth: true
          }
        });

        if (isDestroyed) return;
        instanceRef.current = instance;

        const map = new Map({ extent });
        instance.add(map);

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

        const [mercatorX, mercatorY] = transform(
          [modelPosition[0], modelPosition[1]], 
          'EPSG:4326', 
          'EPSG:3857'
        );
        
        console.log('Coordonnées GPS:', modelPosition[0], modelPosition[1]);
        console.log('Coordonnées Mercator:', mercatorX, mercatorY);

        const controls = new MapControls(instance.view.camera, instance.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.screenSpacePanning = true;
        controls.zoomToCursor = true;
        instance.view.setControls(controls);

        const ambientLight = new HemisphereLight(0xffffff, 0x444444, 4);
        instance.scene.add(ambientLight);

        instance.renderer.shadowMap.enabled = false;

        const loader = new GLTFLoader();
        
        loader.load(
          modelUrl,
          (gltf) => {
            if (isDestroyed || !instance) return;

            try {
              const model = gltf.scene;
              
              model.traverse((child) => {
                if (child instanceof Mesh) {
                  child.castShadow = false;
                  child.receiveShadow = false;
                  
                  if (child.material) {
                    if (Array.isArray(child.material)) {
                      child.material.forEach(mat => {
                        if (mat instanceof MeshStandardMaterial) {
                          mat.needsUpdate = true;
                        }
                      });
                    } else if (child.material instanceof MeshStandardMaterial) {
                      child.material.needsUpdate = true;
                    }
                  }
                }
              });

              const box = new Box3().setFromObject(model);
              const size = box.getSize(new Vector3());

              model.position.set(
                mercatorX,
                mercatorY,
                modelPosition[2]
              );

              model.rotation.set(modelRotation[0], modelRotation[1], modelRotation[2]);
              model.scale.setScalar(modelScale);
              model.updateMatrixWorld(true);

              instance.add(model);

              const maxDim = Math.max(size.x, size.y, size.z) * modelScale;
              const distance = Math.max(maxDim * 10, 500); 
              
              instance.view.camera.position.set(
                mercatorX + distance * 0.5,
                mercatorY + distance * 0.5,
                distance * 0.8
              );
              
              const lookAtPoint = new Vector3(mercatorX, mercatorY, modelPosition[2]);
              instance.view.camera.lookAt(lookAtPoint);
              controls.target.copy(lookAtPoint);
              controls.update();
              
              if (instance) {
                instance.notifyChange();
              }
              
            } catch (error) {
              console.error('Erreur lors du chargement du modèle:', error);
            }
          },
        );

      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
      }
    };

    const timer = setTimeout(initializeScene, 100);

    return () => {
      isDestroyed = true;
      clearTimeout(timer);
      
      if (instance) {
        try {
          if (instance.renderer) {
            instance.renderer.dispose();
          }
          instance.dispose();
        } catch (error) {
          console.warn('Erreur lors du nettoyage:', error);
        }
        instanceRef.current = null;
      }
    };
  }, [modelUrl]);

  return (
      <MapContainer ref={mapContainer} style={{ marginTop: '20px' }} />
  );
};

export default GLBGiro3D;