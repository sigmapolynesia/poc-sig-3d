import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import MapContainer from '../MapContainer';
import { viewerOptions } from '../../utils/cesium-utils';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

interface ReliefCesiumJSProps {
  center?: [number, number];
  zoom?: number;
  terrainExaggeration?: number;
}

const ReliefCesiumJS: React.FC<ReliefCesiumJSProps> = ({
  center = [-149.43, -17.67], // Tahiti coordinates
  zoom = 12,
  terrainExaggeration = 2.0
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const viewer = useRef<Cesium.Viewer | null>(null);

  const zoomToHeight = (zoom: number): number => {
    return 40000000 / Math.pow(2, zoom);
  };

  useEffect(() => {
    if (!mapContainer.current || viewer.current) return;

    // Initialize Cesium viewer
    viewer.current = new Cesium.Viewer(mapContainer.current, {
      ...viewerOptions,
      terrainProvider: undefined, // We'll set this after initialization
    });

    const cesiumViewer = viewer.current;

    // Remove default imagery layers
    cesiumViewer.imageryLayers.removeAll();

    // Add base imagery layer
    if (MAPTILER_KEY) {
      // Use MapTiler satellite imagery
      const mapTilerProvider = new Cesium.UrlTemplateImageryProvider({
        url: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
        minimumLevel: 1,
        maximumLevel: 18,
        credit: new Cesium.Credit('© MapTiler © OpenStreetMap contributors', true),
        tilingScheme: new Cesium.WebMercatorTilingScheme()
      });
      cesiumViewer.imageryLayers.addImageryProvider(mapTilerProvider);
    } else {
      // Fallback to OpenStreetMap
      cesiumViewer.imageryLayers.addImageryProvider(
        new Cesium.OpenStreetMapImageryProvider({
          url: 'https://tile.openstreetmap.org/'
        })
      );
    }

    // Add terrain provider for relief
    const setTerrainProvider = async () => {
      let terrainProvider: Cesium.TerrainProvider;
      if (MAPTILER_KEY) {
        terrainProvider = new Cesium.CesiumTerrainProvider({
          url: `https://api.maptiler.com/tiles/terrain-quantized-mesh-v2/?key=${MAPTILER_KEY}`,
          credit: new Cesium.Credit('© MapTiler'),
          requestVertexNormals: true,
          requestWaterMask: true
        } as any);
      } else {
        terrainProvider = await Cesium.createWorldTerrainAsync({
          requestVertexNormals: true,
          requestWaterMask: true
        });
      }
      cesiumViewer.terrainProvider = terrainProvider;
    };
    setTerrainProvider();

    // Set terrain exaggeration
    cesiumViewer.scene.verticalExaggeration = terrainExaggeration;

    // Enable lighting based on sun/moon positions
    cesiumViewer.scene.globe.enableLighting = true;
    cesiumViewer.scene.globe.atmosphereHueShift = -0.1;
    cesiumViewer.scene.globe.atmosphereSaturationShift = 0.1;

    // Set initial camera position
    cesiumViewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        center[0], 
        center[1], 
        zoomToHeight(zoom)
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45), // Angled view to show relief
        roll: 0.0
      }
    });

    // Add some visual enhancements
    cesiumViewer.scene.fog.enabled = true;
    cesiumViewer.scene.fog.density = 0.0002;
    cesiumViewer.scene.fog.screenSpaceErrorFactor = 2.0;

    // Handle terrain loading
    const terrainLoadingHandler = () => {
      console.log('Terrain loaded successfully');
    };

    const terrainProvider = cesiumViewer.terrainProvider as any;
    if (terrainProvider.readyPromise && typeof terrainProvider.readyPromise.then === 'function') {
      terrainProvider.readyPromise.then(terrainLoadingHandler).catch((error: any) => {
        console.error('Error loading terrain:', error);
      });
    } else {
      // Fallback: call handler immediately if readyPromise is not available
      terrainLoadingHandler();
    }

    return () => {
      if (viewer.current) {
        viewer.current.destroy();
        viewer.current = null;
      }
    };
  }, []);

  // Update camera when center or zoom changes
  useEffect(() => {
    if (viewer.current) {
      viewer.current.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          center[0], 
          center[1], 
          zoomToHeight(zoom)
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0.0
        }
      });
    }
  }, [center, zoom]);

  // Update terrain exaggeration
  useEffect(() => {
    if (viewer.current) {
      viewer.current.scene.verticalExaggeration = terrainExaggeration;
    }
  }, [terrainExaggeration]);

  return (
    <MapContainer 
      ref={mapContainer} 
      style={{ 
        marginTop: '20px', 
        height: '100%', 
        width: '100%' 
      }} 
    />
  );
};

export default ReliefCesiumJS;