import { useEffect, useRef } from 'react';
import MapContainer from '../MapContainer';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import olms from 'ol-mapbox-style';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const GeojsonGiro3D: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    const vectorSource = new VectorSource({
      url: 'https://sigmapolynesia.com/assets/test.geojson',
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

    const map = new Map({
      target: mapContainer.current,
      view: new View({
        center: fromLonLat([-149.57, -17.67]),
        zoom: 10.15
      })
    });

    olms(
      map, 
      `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`
    ).then(function() {
      map.addLayer(vectorLayer);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
      }
    };
  }, []);

  return <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%', marginTop: '20px' }}/>;
};

export default GeojsonGiro3D;