import { useEffect, useRef } from 'react';
import maplibregl, { Map, LngLat, MercatorCoordinate } from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import MapContainer from '../MapContainer';
import '../styles.css';
import { GLB_URL, DEM_URL } from './config';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const GLBRMapGL = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const container = mapContainer.current;

    const sceneOrigin = new LngLat(-140.168858919563, -8.86359936055535);
    const model1Location = new LngLat(-140.168868, -8.8634);

    const calculateDistanceMercatorToMeters = (
      from: MercatorCoordinate,
      to: MercatorCoordinate
    ) => {
      const mercatorPerMeter = from.meterInMercatorCoordinateUnits();
      const dEast = to.x - from.x;
      const dNorth = from.y - to.y;
      return {
        dEastMeter: dEast / mercatorPerMeter,
        dNorthMeter: dNorth / mercatorPerMeter,
      };
    };

    const loadModel = async () => {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(
        GLB_URL
      );
      return gltf.scene;
    };

    const initMap = async () => {
      const map = new maplibregl.Map({
        container: container,
        center: [-140.168868, -8.863563],
        zoom: 16.27,
        pitch: 60,
        bearing: -28.5,
        canvasContextAttributes: { antialias: true, preserveDrawingBuffer: true },
        style: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`,
      });

      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl());
        
            map.on('load', () => {
              map.addSource("terrain", {
                "type": "raster-dem",
                "url": DEM_URL,
              });
      
              map.addSource("hillshade", {
                "type": "raster-dem",
                "url": DEM_URL,
              });
      
              map.addLayer({
                "id": "hillshade",
                "type": "hillshade",
                "source": "hillshade",
                layout: {visibility: 'visible'},
                paint: {
                  'hillshade-shadow-color': '#473B24',
                  'hillshade-highlight-color': '#FAFAFF',
                  'hillshade-accent-color': '#8B7355',
                  'hillshade-illumination-direction': 315,
                  'hillshade-illumination-anchor': 'viewport',
                  'hillshade-exaggeration': 0.35
                }
              });
      
              map.setTerrain({
                source: "terrain",
                exaggeration: 1
              });
            });
      

      const [model1] = await Promise.all([
        loadModel(),
        new Promise<void>((resolve) => map.once('load', resolve)),
      ]);

      type CustomLayerWithThree = {
        id: string;
        type: 'custom';
        renderingMode: '3d';
        scene?: THREE.Scene;
        camera?: THREE.Camera;
        renderer?: THREE.WebGLRenderer;
        onAdd(map: Map, gl: WebGLRenderingContext): void;
        render(_gl: WebGLRenderingContext, matrix: unknown): void;
      };

      const customLayer: CustomLayerWithThree = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',

        onAdd(map: Map, gl: WebGLRenderingContext) {
          const camera = new THREE.Camera();
          const scene = new THREE.Scene();
          scene.rotateX(Math.PI / 2);

          const light = new THREE.DirectionalLight(0xffffff, 4);
          light.position.set(180, 180, 100).normalize();
          scene.add(light);

          const sceneElevation = map.queryTerrainElevation(sceneOrigin) || 0;
          const model1Elevation = map.queryTerrainElevation(model1Location) || 0;

          const model1up = model1Elevation - sceneElevation;

          const originMercator = MercatorCoordinate.fromLngLat(sceneOrigin);
          const model1Merc = MercatorCoordinate.fromLngLat(model1Location);

          const { dEastMeter: m1east, dNorthMeter: m1north } = calculateDistanceMercatorToMeters(originMercator, model1Merc);
          
          model1.position.set(m1east, model1up - 65.3, m1north);

          scene.add(model1);

          const renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
          });
          renderer.autoClear = false;

          (this as CustomLayerWithThree).scene = scene;
          (this as CustomLayerWithThree).camera = camera;
          (this as CustomLayerWithThree).renderer = renderer;
        },

        render(_gl: WebGLRenderingContext, matrix: unknown) {
          const map = mapRef.current!;
          const offsetElevation = map.queryTerrainElevation(sceneOrigin) || 0;
          const originMercator = MercatorCoordinate.fromLngLat(sceneOrigin, offsetElevation);

          const transform = {
            translateX: originMercator.x,
            translateY: originMercator.y,
            translateZ: originMercator.z,
            scale: originMercator.meterInMercatorCoordinateUnits(),
          };

          const projMatrix = new THREE.Matrix4().fromArray(
            (matrix as { defaultProjectionData: { mainMatrix: number[] } }).defaultProjectionData.mainMatrix
          );
          const transMatrix = new THREE.Matrix4()
            .makeTranslation(transform.translateX, transform.translateY, transform.translateZ)
            .scale(new THREE.Vector3(transform.scale, -transform.scale, transform.scale));

          const camera = (this as CustomLayerWithThree).camera!;
          const renderer = (this as CustomLayerWithThree).renderer!;
          const scene = (this as CustomLayerWithThree).scene!;

          camera.projectionMatrix = projMatrix.multiply(transMatrix);
          renderer.resetState();
          renderer.render(scene, camera);
          map.triggerRepaint();
        },
      };

      map.addLayer(customLayer);
    };

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ marginTop: '20px' }} />;
};

export default GLBRMapGL;
