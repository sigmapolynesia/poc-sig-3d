import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import MapContainer from '../MapContainer';
import { cesiumCenter, viewerOptions } from '../../utils/cesium-utils';

const GEOJSON_URL = 'https://sigmapolynesia.com/assets/test.geojson';
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const GeojsonCesiumJS: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const viewer = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (mapContainer.current) {
      viewer.current = new Cesium.Viewer(mapContainer.current, {
        ...viewerOptions,
      });
      
      viewer.current.imageryLayers.removeAll();
      
      const mapTilerProvider = new Cesium.UrlTemplateImageryProvider({
        url: `https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
        minimumLevel: 1,
        maximumLevel: 19,
        credit: new Cesium.Credit('© MapTiler © OpenStreetMap contributors', true)
      });
      
      viewer.current.imageryLayers.addImageryProvider(mapTilerProvider);

      cesiumCenter(viewer.current);
      
      const geoJsonPromise = Cesium.GeoJsonDataSource.load(GEOJSON_URL, {
        stroke: Cesium.Color.BLUE,
        fill: Cesium.Color.BLUE.withAlpha(0.5),
        strokeWidth: 3
      });

      geoJsonPromise.then(dataSource => {
        viewer.current?.dataSources.add(dataSource);
      }).catch(error => {
        console.error('Erreur lors du chargement du GeoJSON:', error);
      });
    }

    return () => {
      if (viewer.current) {
        viewer.current.destroy();
        viewer.current = null;
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
};

export default GeojsonCesiumJS;