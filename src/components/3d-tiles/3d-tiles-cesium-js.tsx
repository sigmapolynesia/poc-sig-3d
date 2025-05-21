import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import MapContainer from '../MapContainer';
import { TILESET_URL } from './config';
import { viewerOptions } from '../../utils/cesium-utils';

const DtilesCesiumJS = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const viewer = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (mapContainer.current && !viewer.current) {
      
      viewer.current = new Cesium.Viewer(mapContainer.current, {
        ...viewerOptions,
      });

      viewer.current.imageryLayers.removeAll();
      
      viewer.current.imageryLayers.addImageryProvider(
        new Cesium.OpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/'
        })
      );

      const loadTileset = async () => {
        try {
          if (viewer.current && TILESET_URL) {
            const tileset = await Cesium.Cesium3DTileset.fromUrl(TILESET_URL, {
              maximumScreenSpaceError: 16,
            });

            tileset.style = new Cesium.Cesium3DTileStyle({
              pointSize: '1.2',
            });

            viewer.current.scene.primitives.add(tileset);

            if (viewer.current) {
              viewer.current.zoomTo(tileset);
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
      if (viewer.current) {
        viewer.current.destroy();
        viewer.current = null;
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ marginTop: '20px' }} />;
};

export default DtilesCesiumJS;