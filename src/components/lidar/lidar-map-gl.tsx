import { useRef, useCallback } from 'react';
import { LASLoader } from '@loaders.gl/las';
import { PointCloudLayer } from '@deck.gl/layers';
import { Map, useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { DeckProps } from '@deck.gl/core';
import { COORDINATE_SYSTEM } from '@deck.gl/core';
import { LAZ_URL } from './config.ts';
import 'maplibre-gl/dist/maplibre-gl.css';

const INITIAL_VIEW_STATE = {
  longitude: -140.168868, 
  latitude: -8.863563,  
  zoom: 14,
  pitch: 0,
  bearing: 0
};

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
};

type DataProps = {
  position: [x: number, y: number, z: number];
  normal?: [nx: number, ny: number, nz: number];
  color: [r: number, g: number, b: number];
};

const LidarMapGL = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  const onDataLoad = useCallback((data: any) => {
    console.log('Loaded data:', data);
    
    const header = data.header;
    if (header) {
      console.log('LAS Header:', header);
    }
  }, []);

  const layers = [
    new PointCloudLayer({
      id: 'LazPointCloudLayer',
      data: LAZ_URL,
      onDataLoad,
      opacity: 1.0,
      pointSize: 1,
      loaders: [LASLoader],
      loadOptions: {
        las: {
          fp64: true,
          colorDepth: 'auto'
        }
      },
      getColor: (point: DataProps) => point.color,
      getPosition: (point: DataProps) => point.position,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    })
  ];

  return (
    <div style={{ position: 'relative', height: '1000px', width: '100%', marginTop: '20px' }} ref={mapContainer}>
      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=oXKqIc8LHoao1mTqHfbp"
        style={{ width: '100%', height: '100%' }}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }} 
      >
        <DeckGLOverlay 
          layers={layers}
          getTooltip={({object}) => object && `Position: ${object.position.join(', ')}`}
        />
      </Map>
    </div>
  );
};

export default LidarMapGL;