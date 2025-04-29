import { WMTSLayer } from '../types/wmts';
import { generateWMTSTileUrl } from '../types/wmts-parse';
import maplibregl from 'maplibre-gl';

export const configureMapLibreWMTS = (
  map: maplibregl.Map, 
  layer: WMTSLayer, 
  baseUrl: string
): void => {
  if (!map || !layer) return;

  if (map.getSource('wmts-source')) {
    map.removeLayer('wmts-layer');
    map.removeSource('wmts-source');
  }

  const tileUrl = generateWMTSTileUrl(baseUrl, layer);

  map.addSource('wmts-source', {
    type: 'raster',
    tiles: [tileUrl],
    tileSize: 256,
    attribution: '© Tefenua - Polynésie française'
  });

  map.addLayer({
    id: 'wmts-layer',
    type: 'raster',
    source: 'wmts-source',
    layout: { visibility: 'visible' }
  });
};

export const posTahiti = {
  lat: -17.67,
  lon: -149.43,
};

export const maplibreCenter = (
  map: maplibregl.Map, 
  zoom: number = 9.15
): void => {
  if (!map) return;
  
  map.setCenter([posTahiti.lon, posTahiti.lat]);
  map.setZoom(zoom);
};