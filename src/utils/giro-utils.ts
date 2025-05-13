import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Map from "@giro3d/giro3d/entities/Map.js";
import VectorSource from '@giro3d/giro3d/sources/VectorSource';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource';
import XYZ from 'ol/source/XYZ';
import { transform } from 'ol/proj';
import { StyleFunction } from 'ol/style/Style';


export const addMapTilerBaseLayer = async (
  map: Map, 
  maptilerKey: string, 
  styleType: string = 'streets-v2'
): Promise<void> => {
  if (!maptilerKey) {
    throw new Error('MapTiler API key is required');
  }

  const olXyzSource = new XYZ({
    url: `https://api.maptiler.com/maps/${styleType}/256/{z}/{x}/{y}.png?key=${maptilerKey}`,
    crossOrigin: 'anonymous',
  });

  const tileSource = new TiledImageSource({
    source: olXyzSource
  });

  const baseLayer = new ColorLayer({
    name: 'maptiler-base',
    source: tileSource,
    extent: map.extent,
  });

  await map.addLayer(baseLayer);
};

export const configureGiro3dGeoJSON = async (
    url: string, 
    map: Map, 
    _maptilerKey?: string,
    sourceCRS: string = 'EPSG:4326' 
  ): Promise<void> => {
    const styleFunction = (feature: FeatureLike) => {
      const geometryType = feature.getGeometry()?.getType();
      const properties = feature.getProperties();
      
      const color = properties.color || '#0080ff';
      const name = properties.name || properties.title || '';
      
      if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
        return new Style({
          fill: new Fill({
            color: 'rgba(100, 149, 237, 0.4)' 
          }),
          stroke: new Stroke({
            color: color,
            width: 2
          })
        });
      } 
      else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
        return new Style({
          stroke: new Stroke({
            color: color,
            width: 3,
            lineDash: properties.dashed ? [5, 5] : undefined
          })
        });
      }
      else if (geometryType === 'Point' || geometryType === 'MultiPoint') {
        return new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: '#ff7800'  
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2
            })
          }),
          text: name ? new Text({
            text: name,
            offsetY: -15,
            font: '14px Calibri,sans-serif',
            fill: new Fill({
              color: '#000'
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 3
            })
          }) : undefined
        });
      }
      else {
        return new Style({
          stroke: new Stroke({
            color: '#3366cc',
            width: 1
          })
        });
      }
    };
  
    try {
      const geoJSONFormat = new GeoJSON({
        dataProjection: sourceCRS,
        featureProjection: map.extent.crs
      });
      
      const vectorSource = new VectorSource({
        data: {
          url: url,
          format: geoJSONFormat
        },
        style: styleFunction
      });
  
      const geoJSONLayer = new ColorLayer({
        name: 'geojson-layer',
        source: vectorSource,
        extent: map.extent,
      });
  
      await map.addLayer(geoJSONLayer);
      
    } catch (error) {
      console.error('Error adding GeoJSON layer:', error);
      throw error;
    }
  }

export const centerViewOnLocation = (
  instance: any,
  controls: any,
  lon: number,
  lat: number,
  zoom: number = 2,
  sourceCRS: string = 'EPSG:4326',
  targetCRS: string = 'EPSG:3857'
) => {
  let [x, y] = [lon, lat];
  
  if (sourceCRS !== targetCRS) {
    [x, y] = transform([lon, lat], sourceCRS, targetCRS);
  }
  
  const height = targetCRS === 'EPSG:3857' 
    ? 40000000 / Math.pow(2, zoom) 
    : 180 / Math.pow(2, zoom); 
  
  instance.view.camera.position.set(x, y, height);
  controls.target.set(x, y, 0);
  controls.update();
};

export const createMVTStyle = (): StyleFunction => {
  const fill = new Fill({ color: 'rgba(0, 100, 200, 0.5)' });
  const stroke = new Stroke({ color: 'rgba(0, 100, 200, 1)', width: 1 });
  
  return (feature: FeatureLike) => {
    const geometryType = feature.getGeometry()?.getType();
    
    if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      return new Style({
        fill: fill,
        stroke: stroke
      });
    } 
    else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
      return new Style({
        stroke: stroke
      });
    }
    else {
      return new Style({
        stroke: stroke
      });
    }
  };
};