import { useRef } from 'react';
import { Map, useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LASLoader } from '@loaders.gl/las';
import { PointCloudLayer } from '@deck.gl/layers';
import { DeckProps, COORDINATE_SYSTEM } from '@deck.gl/core';
import { LAZ_URL } from './config.ts';
import proj4 from 'proj4';
import MapContainer from '../MapContainer.tsx';

proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type DataType = {
  position: [x: number, y: number, z: number];
  normal?: [nx: number, ny: number, nz: number];
  color: [r: number, g: number, b: number];
};

function preciseWebMercatorToLonLat(coordinates: [number, number, number]): [number, number, number] {
  const [x, y, z] = coordinates;
  const [lon, lat] = proj4('EPSG:3857', 'EPSG:4326', [x, y]);
  return [lon, lat, z];
}

const LidarMapGL = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  
  const mercatorCoordinates: [number, number, number] = [-15603481, -990789, 928];
  
  const [longitude, latitude, altitude] = preciseWebMercatorToLonLat(mercatorCoordinates);
  
  console.log("Position précise en lon/lat:", longitude, latitude, altitude);

  const layers = [
    new PointCloudLayer({
      id: 'LazPointCloudLayer',
      data: LAZ_URL,
      opacity: 1, 
      pointSize: 0.5,
      loaders: [LASLoader],
      loadOptions: {
        las: {
          colorDepth: 'auto',
        }
      },
      getColor: (d: DataType) => d.color || [255, 0, 0],
      getPosition: (d: DataType) => d.position,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    })
  ];

  return (
    <div style={{ position: 'relative', height: '1000px', width: '100%', marginTop: '20px' }}>
      <Map
        initialViewState={{
          longitude: longitude,
          latitude: latitude,
          zoom: 15,
          pitch: 45,
          bearing: 0
        }}
        mapStyle="https://demotiles.maplibre.org/style.json"
      >
        <DeckGLOverlay layers={layers}/>
      </Map>
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.8)',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <strong>Web Mercator (EPSG:3857):</strong><br/>
        X: {mercatorCoordinates[0].toFixed(3)}<br/>
        Y: {mercatorCoordinates[1].toFixed(3)}<br/>
        Z: {mercatorCoordinates[2].toFixed(3)}<br/>
        <strong>WGS84 (EPSG:4326):</strong><br/>
        Lon: {longitude.toFixed(6)}°<br/>
        Lat: {latitude.toFixed(6)}°<br/>
        Alt: {altitude.toFixed(2)}m
      </div>
      <MapContainer ref={mapContainer} style={{ display: 'none' }} />
    </div>
  );
};

export default LidarMapGL;