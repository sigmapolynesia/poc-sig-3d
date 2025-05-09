import { useEffect, useRef } from 'react';
import MapContainer from '../MapContainer';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface WMTSLayerOptions {
  host: any;
  identifier: string;
  style?: string;
  format: string;
  tileMatrixSet: string;
}

const generateMapLibreWMTSTileUrl = (layer: WMTSLayerOptions): string => {
  return `${layer.host}/geoserver/gwc/service/wmts/rest/${layer.identifier}/${layer.tileMatrixSet}/${layer.tileMatrixSet}:{z}/{y}/{x}?format=${layer.format}`;
  //return `${layer.host}/geoserver/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&layer=${layer.identifier}&style=${layer.style}&tilematrix=${layer.tileMatrixSet}:{z}&tilematrixset=${layer.tileMatrixSet}&tilecol={x}&tilerow={y}&format=${layer.format}`;
};

const MVTMapGL = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const pgaLayer = {
      host: 'https://geoserver.sigmapolynesia.com',
      identifier: 'PAEA:PGA',
      style: '',
      format: 'application/vnd.mapbox-vector-tile', 
      tileMatrixSet: 'EPSG:4326'
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'pga-source': {
            type: 'vector', 
            tiles: [generateMapLibreWMTSTileUrl(pgaLayer)],
            bounds: [-149.7, -17.8, -149.5, -17.6],
            minzoom: 0,
            maxzoom: 21
          },
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-background',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          },
          {
            id: 'pga-layer',
            type: 'fill', 
            source: 'pga-source',
            'source-layer': 'PAEA:PGA', 
            paint: {
              'fill-color': 'rgba(0, 100, 200, 0.5)',
              'fill-outline-color': 'rgba(0, 100, 200, 1)'
            },
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [-149.56, -17.53],
      zoom: 12
    });

    mapInstance.current = map;

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

  return <MapContainer ref={mapContainer} style={{ marginTop: '20px' }} />;
};

export default MVTMapGL;