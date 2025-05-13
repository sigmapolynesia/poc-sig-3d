import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorTileLayer from 'ol/layer/VectorTile';
import OSM from 'ol/source/OSM';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke } from 'ol/style';
import MapContainer from '../MapContainer';

interface TMSLayerOptions {
  host: string;
  identifier: string;
}

const generateOpenLayersTMSUrl = (layer: TMSLayerOptions): string => {
  return `${layer.host}/geoserver/gwc/service/tms/1.0.0/${layer.identifier}@WebMercatorQuad@pbf/{z}/{x}/{-y}.pbf`;
};

interface MVTGiro3DProps {
  center?: [number, number];
  zoom?: number;
}

const MVTGiro3D: React.FC<MVTGiro3DProps> = ({
  center = [-149.55, -17.70],
  zoom = 13,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const pgaLayer = {
      host: 'https://geoserver.sigmapolynesia.com',
      identifier: encodeURIComponent('PAEA:PGA')
    };

    const olCenter = fromLonLat(center);

    const osmLayer = new TileLayer({
      source: new OSM(),
    });

    const mvtSource = new VectorTileSource({
      format: new MVT(),
      url: generateOpenLayersTMSUrl(pgaLayer),
      maxZoom: 21,
    });

    const mvtLayer = new VectorTileLayer({
      source: mvtSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(0, 100, 200, 0.5)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 100, 200, 1)',
          width: 1,
        }),
      }),
    });

    const map = new Map({
      target: mapContainer.current,
      layers: [osmLayer, mvtLayer],
      view: new View({
        center: olCenter,
        zoom: zoom,
        maxZoom: 22,
      }),
    });

    mapInstance.current = map;

    mvtSource.on('tileloaderror', (e) => {
      console.error('Erreur chargement tuile OpenLayers:', e);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      view.setCenter(fromLonLat(center));
      view.setZoom(zoom);
    }
  }, [center, zoom]);

  return (
    <MapContainer ref={mapContainer} style={{ marginTop: '20px', height: '100%', width: '100%' }} />
  );
};

export default MVTGiro3D;