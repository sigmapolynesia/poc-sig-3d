import { WMTSLayer } from '../types/wmts';
import * as Cesium from 'cesium';

export const viewerOptions = {
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: true,
  navigationHelpButton: false,
  animation: false,
  timeline: false,
  fullscreenButton: true,
  vrButton: false,
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),
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
    tileMatrixSetID: "EPSG:900913",
    tileMatrixLabels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
    maximumLevel: 19,
    credit: new Cesium.Credit("© Tefenua - Polynésie française")
  });

  viewer.imageryLayers.addImageryProvider(wmtsProvider);
};

export const posTahiti = {
  cesiumlat: -17.67,
  cesiumlon: -149.43,
};

export const cesiumCenter = (
  viewer: Cesium.Viewer,
  height: number = 265000
): void => {
  if (!viewer) return;
  
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(posTahiti.cesiumlon, posTahiti.cesiumlat, height),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0
    }
  });
};