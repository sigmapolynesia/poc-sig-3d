import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import olms from 'ol-mapbox-style';

export const configureGiro3dGeoJSON = async (url: string, map: Map, maptilerKey: string): Promise<void> => {
  const vectorSource = new VectorSource({
    url: url,
    format: new GeoJSON()
  });

  const styleFunction = (feature: FeatureLike) => {
    const geometryType = feature.getGeometry()?.getType();
    
    if (geometryType === 'Polygon' || geometryType === 'MultiPolygon' || 
        geometryType === 'LineString' || geometryType === 'MultiLineString') {
      return new Style({
        fill: new Fill({
          color: 'rgba(100, 149, 237, 0.4)' 
        }),
        stroke: new Stroke({
          color: '#0080ff',
          width: 2
        })
      });
    } 
    else if (geometryType === 'Point' || geometryType === 'MultiPoint') {
      return new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: '#ff7800'  
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 2
          })
        }),
        text: feature.get('name') ? new Text({
          text: feature.get('name'),
          offsetY: -15,
          font: '12px Calibri,sans-serif',
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

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: styleFunction,
  });

  await olms(
        map,
        `https://api.maptiler.com/maps/streets/style.json?key=${maptilerKey}`
    );
    map.addLayer(vectorLayer);
};

