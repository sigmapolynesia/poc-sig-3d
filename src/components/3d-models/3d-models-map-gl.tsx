import { useEffect, useRef } from 'react';
import maplibregl, { Map, MercatorCoordinate, CustomLayerInterface } from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import '../styles.css';
import MapContainer from '../MapContainer';
import { GLTF_URL } from './config';

const Model3DMapGL = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        'https://api.maptiler.com/maps/basic/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
      zoom: 15,
      center: [-140.168868, -8.863563],
      pitch: 30,
      canvasContextAttributes: { antialias: true },
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

    const customLayer: CustomLayerInterface = {
      id: '3d-model',
      type: 'custom',
      renderingMode: '3d',
      onAdd(map, gl) {
        const scene = new THREE.Scene();
        const camera = new THREE.Camera();

        const light1 = new THREE.DirectionalLight(0xffffff);
        light1.position.set(0, -70, 100).normalize();
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff);
        light2.position.set(0, 70, 100).normalize();
        scene.add(light2);

        const loader = new GLTFLoader();
        loader.load(
          GLTF_URL,
          (gltf) => {
            scene.add(gltf.scene);
          }
        );

        const renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });
        renderer.autoClear = false;

        (this as any).scene = scene;
        (this as any).camera = camera;
        (this as any).renderer = renderer;
      },
      render(_gl, matrix) {
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

        const m = new THREE.Matrix4().fromArray(matrix.defaultProjectionData.mainMatrix);
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

        (this as any).camera.projectionMatrix = m.multiply(l);
        (this as any).renderer.resetState();
        (this as any).renderer.render((this as any).scene, (this as any).camera);
        map.triggerRepaint();
      },
    };

    map.on('style.load', () => {
      map.addLayer(customLayer);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ marginTop: '20px' }} />;
};

export default Model3DMapGL;
