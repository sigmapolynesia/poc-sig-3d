import React, { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import CesiumMVTImageryProvider from 'cesium-mvt-imagery-provider';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import MapContainer from '../MapContainer';
import { generateTMSTileUrl } from '../../types/tms-parse.ts';
import { viewerOptions } from '../../utils/cesium-utils';

interface MVTCesiumProps {
  center?: [number, number];
  zoom?: number;
}

const MVTCesium: React.FC<MVTCesiumProps> = ({
  center = [-149.55, -17.70],
  zoom = 10,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const zoomToHeight = (zoom: number): number => {
    return 40000000 / Math.pow(2, zoom);
  };

  useEffect(() => {
    if (!mapContainer.current || viewerRef.current) return;

    const pgaLayer = {
      host: 'https://geoserver.sigmapolynesia.com',
      identifier: encodeURIComponent('PAEA:PGA')
    };
    const viewer = new Cesium.Viewer(mapContainer.current, {
      ...viewerOptions,
    });

    viewer.imageryLayers.removeAll();
    
    viewerRef.current = viewer;
    
    viewer.imageryLayers.addImageryProvider(
      new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/'
      })
    );

    viewerRef.current = viewer;

    const mvtUrl = generateTMSTileUrl(pgaLayer);
    try {
      const mvtImageryProvider = new CesiumMVTImageryProvider({
        urlTemplate: mvtUrl,
        layerName: 'pga_zone_urba_v',
        style: () => {
          return {
            fillStyle: 'rgba(0, 100, 200, 0.5)',
            strokeStyle: 'rgba(0, 100, 200, 1)',
            lineWidth: 1
          };
        },
        onSelectFeature: (feature: any) => {
          console.log('Feature sélectionnée:', feature);
        },
        credit: 'GeoServer PAEA:PGA',
        minimumLevel: 0,
        maximumLevel: 21,
        rectangle: Cesium.Rectangle.fromDegrees(-149.7, -17.8, -149.5, -17.6)
      });
      
      const mvtLayer = viewer.imageryLayers.addImageryProvider(mvtImageryProvider);
      mvtLayer.alpha = 1.0; 
    } catch (error) {
      console.error('Erreur lors du chargement des tuiles MVT:', error);
    }

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        center[0], 
        center[1], 
        zoomToHeight(zoom)
      ),
      orientation: {
        heading: 0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        roll: 0
      }
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return (
    <MapContainer ref={mapContainer} style={{ marginTop: '20px', height: '100%', width: '100%' }} />
  );
};

export default MVTCesium;