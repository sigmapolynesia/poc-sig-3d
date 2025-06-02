import { useEffect, useRef } from 'react';
import '../styles.css';
import MapContainer from '../MapContainer';
import { GLTF_URL } from './config';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

interface GLTFMapGLProps {
  center?: [number, number];
  zoom?: number;
}

const ReliefGLTF: React.FC<GLTFMapGLProps> = ({
  center = [-140.1289, -8.8732],
  zoom = 12,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          },
        },
        layers: [
          {
            id: 'osm-background',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          },
        ],
      },
      center: center,
      zoom: zoom,
      pitch: 60,
    });

    mapInstance.current = map;
    map.addControl(new maplibregl.NavigationControl());

    const customLayer = {
      id: '3d-model',
      type: 'custom',
      renderingMode: '3d',
      camera: undefined as undefined | THREE.Camera,
      scene: undefined as undefined | THREE.Scene,
      map: undefined as undefined | maplibregl.Map,
      renderer: undefined as undefined | THREE.WebGLRenderer,
      modelTransform: {
        translateX: maplibregl.MercatorCoordinate.fromLngLat(
          center,
          0
        ).x,
        translateY: maplibregl.MercatorCoordinate.fromLngLat(
          center,
          0
        ).y,
        translateZ: 0,
        scale: 5.41843220338983e-6 
      },
      onAdd: function (map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(0, 70, 100).normalize();
        this.scene.add(directionalLight2);

        const loader = new GLTFLoader();
        loader.load(
          GLTF_URL,
          (gltf) => {
            this.scene.add(gltf.scene);
            
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            const scale = 0.5; 
            gltf.scene.scale.set(scale, scale, scale);
            gltf.scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
            
            console.log('Modèle GLTF chargé', { size, center });
          },
          (progress) => {
            console.log('Chargement...', (progress.loaded / progress.total) * 100 + '%');
          },
          (error) => {
            console.error('Erreur lors du chargement du GLTF:', error);
          }
        );

        this.map = map;
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true
        });

        this.renderer.autoClear = false;
      },
      render: function (_gl, matrix) {
        if (!this.scene || !this.camera || !this.renderer) return;

        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          this.map.getPitch() * Math.PI / 180
        );

        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          -this.map.getBearing() * Math.PI / 180
        );

        const m = new THREE.Matrix4().fromArray(matrix as unknown as number[]);
        const l = new THREE.Matrix4()
          .makeTranslation(
            this.modelTransform.translateX,
            this.modelTransform.translateY,
            this.modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              this.modelTransform.scale,
              -this.modelTransform.scale,
              this.modelTransform.scale
            )
          );

        this.camera.projectionMatrix = m.multiply(l).multiply(rotationX).multiply(rotationY);
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
      }
    } as maplibregl.CustomLayerInterface & {
      camera: THREE.Camera;
      scene: THREE.Scene;
      map: maplibregl.Map;
      renderer: THREE.WebGLRenderer;
      modelTransform: {
        translateX: number;
        translateY: number;
        translateZ: number;
        scale: number;
      };
    };

    map.on('style.load', () => {
      map.addLayer(customLayer);
    });

    map.on('error', (e) => {
      console.error('Erreur MapLibre:', e);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(center);
      mapInstance.current.setZoom(zoom);
    }
  }, [center, zoom]);

  return (
    <MapContainer ref={mapContainer} style={{ marginTop: '20px', height: '100%', width: '100%' }} />
  );
};

export default ReliefGLTF;