import { useRef, useState, useCallback } from 'react';
import MapContainer from '../MapContainer';
import {LASLoader} from '@loaders.gl/las';
import { PointCloudLayer } from '@deck.gl/layers';
import { DeckGL } from '@deck.gl/react';
import { OrbitView } from '@deck.gl/core';
import { LAZ_URL } from './config.ts';
import type {OrbitViewState} from '@deck.gl/core';

const INITIAL_VIEW_STATE: OrbitViewState = {
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
  minZoom: 0,
  maxZoom: 10,
  zoom: 1 
};

const LidarDeckGL = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [viewState, updateViewState] = useState<OrbitViewState>(INITIAL_VIEW_STATE);

 const onDataLoad = useCallback((data: any) => {
    console.log('Loaded data:', data); 
    
    const header = (data).header!;
    if (header.boundingBox) {
      const [mins, maxs] = header.boundingBox;
      updateViewState({
        ...INITIAL_VIEW_STATE,
        target: [(mins[0] + maxs[0]) / 2, (mins[1] + maxs[1]) / 2, (mins[2] + maxs[2]) / 2],
        zoom: Math.log2(window.innerWidth / (maxs[0] - mins[0])) - 1
      });
    }
  }, []);


  const layers = [
    new PointCloudLayer({
      id: 'LazPointCloudLayer',
      data: LAZ_URL,
      onDataLoad,
      opacity: 1.0, 
      pointSize: 1.5, 
      loaders: [LASLoader],
      loadOptions: {
        las: {
          fp64: true,
          colorDepth: 'auto' 
        }
      },
      getColor: (point) => point.color,
    })
  ];

  return (
    <div style={{ position: 'relative', height: '1000px', width: '100%', marginTop: '20px' }}>
      <DeckGL
        views={new OrbitView()}
        initialViewState={viewState}
        controller={true}
        layers={layers}        
      />
      <MapContainer ref={mapContainer} style={{ display: 'none' }} />
    </div>
  );
};

export default LidarDeckGL;