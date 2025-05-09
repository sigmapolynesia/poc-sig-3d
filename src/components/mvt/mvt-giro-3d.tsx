import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorTileLayer from 'ol/layer/VectorTile';
import OSM from 'ol/source/OSM';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { Fill, Stroke, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';
import MapContainer from '../MapContainer';

interface WMTSLayerOptions {
  host: string;
  identifier: string;
  style?: string;
  format: string;
  tileMatrixSet: string;
}

const generateOpenLayersWMTSTileUrl = (layer: WMTSLayerOptions): string => {
  return `${layer.host}/geoserver/gwc/service/wmts/rest/${layer.identifier}/${layer.style}/${layer.tileMatrixSet}/{z}/{y}/{x}?format=${layer.format}`;
  //return `${layer.host}/geoserver/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&layer=${layer.identifier}&style=${layer.style}&tilematrix=${layer.tileMatrixSet}:{z}&tilematrixset=${layer.tileMatrixSet}&tilecol={x}&tilerow={y}&format=${layer.format}`;
};

const MVTGiro3D = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    const pgaLayer = {
      host: 'https://geoserver.sigmapolynesia.com',
      identifier: 'PAEA:PGA',
      style: '',
      format: 'application/vnd.mapbox-vector-tile',
      tileMatrixSet: 'EPSG:4326'
    };

    const pgaStyle = new Style({
      fill: new Fill({
        color: 'rgba(0, 100, 200, 0.5)'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 100, 200, 1)',
        width: 1
      })
    });

    const pgaSource = new VectorTileSource({
      format: new MVT(),
      url: generateOpenLayersWMTSTileUrl(pgaLayer),
      maxZoom: 21
    });

    const osmLayer = new TileLayer({
      source: new OSM()
    });

    const pgaVectorLayer = new VectorTileLayer({
      source: pgaSource,
      style: pgaStyle
    });

    const map = new Map({
      target: mapContainer.current,
      layers: [osmLayer, pgaVectorLayer],
      view: new View({
        center: fromLonLat([-149.58, -17.66]), 
        zoom: 12,
        maxZoom: 22
      })
    });

    mapInstance.current = map;

    pgaSource.on('tileloaderror', (e) => {
      console.error('Erreur de chargement des tuiles:', e);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ height: '100%', width: '100%', marginTop: '20px' }} />;
};

export default MVTGiro3D;