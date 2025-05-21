import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import '../styles.css';
import MapContainer from '../MapContainer';
import { TILESET_URL } from './config';

const DtilesCesiumJS = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (mapContainer.current && !viewerRef.current) {
      Cesium.Ion.defaultAccessToken = '';
      
      viewerRef.current = new Cesium.Viewer(mapContainer.current, {
        baseLayerPicker: false,
        geocoder: false,
        homeButton: true,
        sceneModePicker: true,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: true,
        vrButton: false,
        terrainProvider: new Cesium.EllipsoidTerrainProvider()
      });

      viewerRef.current.imageryLayers.removeAll();
      viewerRef.current.imageryLayers.addImageryProvider(
        new Cesium.OpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/'
        })
      );

      if (viewerRef.current.cesiumWidget.creditContainer) {
        (viewerRef.current.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';
      }

      const loadTileset = async () => {
        try {
          if (viewerRef.current && TILESET_URL) {
            const tileset = await Cesium.Cesium3DTileset.fromUrl(TILESET_URL, {
              maximumScreenSpaceError: 16,
            });

            viewerRef.current.scene.primitives.add(tileset);

            if (viewerRef.current) {
              viewerRef.current.zoomTo(tileset);
            }

            tileset.tileFailed.addEventListener((error: any) => {
              console.error('Erreur lors du chargement d\'une tuile:', error);
            });

          }
        } catch (error) {
          console.error('Erreur lors du chargement du tileset 3D:', error);
        }
      };

      loadTileset();

    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ marginTop: '20px' }} />;
};

export default DtilesCesiumJS;