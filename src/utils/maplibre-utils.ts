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

export const configureMapLibreGeoJSON = (
  map: maplibregl.Map,
  sourceId: string = 'default-geojson',
  data: GeoJSON.GeoJSON
): void => {
  if (!map) return;
  
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'geojson',
      data: data
    });
    
    map.addLayer({
      id: `${sourceId}-polygons`,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': 'rgba(100, 149, 237, 0.4)',
        'fill-outline-color': '#0080ff',
      },
      filter: ['==', '$type', 'Polygon']
    });
    
    map.addLayer({
      id: `${sourceId}-polygon-outlines`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#0080ff',
        'line-width': 2, 
      },
      filter: ['==', '$type', 'Polygon']
    });
    
    map.addLayer({
      id: `${sourceId}-lines`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#0080ff',
        'line-width': 2
      },
      filter: ['==', '$type', 'LineString']
    });
    
    map.addLayer({
      id: `${sourceId}-points`,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': 5,
        'circle-color': '#ff7800',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      },
      filter: ['==', '$type', 'Point']
    });
  }
};