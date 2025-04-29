import { WMTSLayer } from '../types/wmts';
import { generateWMTSTileUrl } from '../types/wmts-parse';
import * as Cesium from 'cesium';
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

export const configureCesiumWMTS = (
  viewer: Cesium.Viewer,
  layer: WMTSLayer,
  baseUrl: string
): void => {
  if (!viewer || !layer) return;
  
  viewer.imageryLayers.removeAll();
  
  const wmtsProvider = new Cesium.WebMapTileServiceImageryProvider({
    url: baseUrl,
    layer: layer.identifier,
    style: layer.style || "default",
    format: layer.format,
    tileMatrixSetID: layer.tileMatrixSet,
    tileMatrixLabels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
    maximumLevel: 19,
    credit: new Cesium.Credit("© Tefenua - Polynésie française")
  });

  viewer.imageryLayers.addImageryProvider(wmtsProvider);
};

export const posTahiti = {
  lat: -17.67,
  lon: -149.43,

  cesiumlat: -33.2,
  cesiumlon: -119,
};

export const maplibreCenter = (
  map: maplibregl.Map, 
  zoom: number = 9
): void => {
  if (!map) return;
  
  map.setCenter([posTahiti.lon, posTahiti.lat]);
  map.setZoom(zoom);
};

export const cesiumCenter = (
  viewer: Cesium.Viewer,
  height: number = 500000
): void => {
  if (!viewer) return;
  
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(posTahiti.cesiumlon, posTahiti.cesiumlat, height),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0
    }
  });
};