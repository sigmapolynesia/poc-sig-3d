import { useEffect, useRef } from 'react';
import maplibregl, { Map, MercatorCoordinate, CustomLayerInterface } from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import '../styles.css';
import MapContainer from '../MapContainer';
import { GLTF_URL } from './config';
import { Title } from '@mantine/core';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

interface GLBMapGLProps {
  center?: [number, number];
  zoom?: number;
  apiKey?: string;
}

const GLTFMapGL: React.FC<GLBMapGLProps> = ({
  center = [-140.168868, -8.863563],
  zoom = 15,
  apiKey = MAPTILER_KEY
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
      center,
      zoom,
      pitch: 30,
      canvasContextAttributes: {antialias: true, preserveDrawingBuffer: true}
    });

    mapRef.current = map;

    const modelOrigin: [number, number] = [-140.168868, -8.863563];
    const modelAltitude = 0;
    const modelRotate: [number, number, number] = [Math.PI / 2, 0, 0];

    const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(
      modelOrigin,
      modelAltitude
    );

    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
    };

    interface ThreeLayerContext {
      scene: THREE.Scene;
      camera: THREE.Camera;
      renderer: THREE.WebGLRenderer;
      canvas: HTMLCanvasElement;
    }
    
    const customLayer: CustomLayerInterface = {
      id: '3d-model',
      type: 'custom',
      renderingMode: '3d',
      onAdd(map) {
        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
    
        const light1 = new THREE.DirectionalLight(0xffffff, 4);
        light1.position.set(180, 180, 100).normalize();
        scene.add(light1);
    
        const loader = new GLTFLoader();
        loader.load(GLTF_URL, (gltf) => {
          scene.add(gltf.scene);
        });
    
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
    
        renderer.setSize(map.getCanvas().width, map.getCanvas().height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.autoClear = false;
    
        const canvas = renderer.domElement;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
    
        map.getContainer().appendChild(canvas);
    
        map.on('resize', () => {
          renderer.setSize(map.getCanvas().width, map.getCanvas().height);
        });
    
        const ctx = this as unknown as ThreeLayerContext;
        ctx.scene = scene;
        ctx.camera = camera;
        ctx.renderer = renderer;
        ctx.canvas = canvas;
      },

      render(this: ThreeLayerContext, _gl: WebGLRenderingContext, matrix: unknown) {
        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );

        const m = new THREE.Matrix4().fromArray(
          (matrix as { defaultProjectionData: { mainMatrix: number[] } }).defaultProjectionData.mainMatrix
        );
        const l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        const camera = this.camera;
        const renderer = this.renderer;
        const scene = this.scene;

        camera.projectionMatrix = m.multiply(l);

        renderer.resetState();
        renderer.render(scene, camera);

        map.triggerRepaint();
      },

      onRemove(this: ThreeLayerContext) {
        const renderer = this.renderer;
        const canvas = this.canvas;
        const scene = this.scene;

        if (renderer) {
          renderer.dispose();
        }

        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }

        if (scene) {
          scene.clear();
        }
      },
    };

    map.on('style.load', () => {
      map.addLayer(customLayer);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [apiKey, center, zoom]);

  return(
    <div>
      <Title order={2} mt={10}>GLTF Map GL</Title>
      <MapContainer ref={mapContainer} style={{ marginTop: '20px' }} />
    </div>
  );
};

export default GLTFMapGL;
