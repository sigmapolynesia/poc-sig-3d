import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import MapContainer from '../MapContainer';

const GEOJSON_URL = 'https://sigmapolynesia.com/assets/test.geojson';
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const GeojsonCesiumJS: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (mapContainer.current) {
      const mapTilerProvider = new Cesium.UrlTemplateImageryProvider({
        url: `https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
        minimumLevel: 1,
        maximumLevel: 19,
        credit: new Cesium.Credit('© MapTiler © OpenStreetMap contributors', true)
      });
      
      viewerRef.current = new Cesium.Viewer(mapContainer.current, {
        navigationHelpButton: false,
        homeButton: false,
        timeline: false,
        animation: false,
        fullscreenButton: false,
        geocoder: false,  
        baseLayerPicker: false,
        terrainProvider: new Cesium.EllipsoidTerrainProvider()
      });
      
      viewerRef.current.imageryLayers.removeAll();
      
      viewerRef.current.imageryLayers.addImageryProvider(mapTilerProvider);

      viewerRef.current.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-149.57, -17.67, 265000),
        orientation: {
          heading: Cesium.Math.toRadians(0), 
          pitch: Cesium.Math.toRadians(-90), 
          roll: 0 
        }
      });
      
      const geoJsonPromise = Cesium.GeoJsonDataSource.load(GEOJSON_URL, {
        stroke: Cesium.Color.BLUE,
        fill: Cesium.Color.BLUE.withAlpha(0.5),
        strokeWidth: 3
      });

      geoJsonPromise.then(dataSource => {
        viewerRef.current?.dataSources.add(dataSource);
      }).catch(error => {
        console.error('Erreur lors du chargement du GeoJSON:', error);
      });
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }} />;
};

export default GeojsonCesiumJS;