import { useRef, useState, useEffect, useCallback } from 'react';
import MapContainer from '../MapContainer';
import {LASWorkerLoader} from '@loaders.gl/las';
import { PointCloudLayer } from '@deck.gl/layers';
import { DeckGL } from '@deck.gl/react';
import { OrbitView, LinearInterpolator } from '@deck.gl/core';
import { LAZ_URL } from './config.ts';
import type {OrbitViewState} from '@deck.gl/core';

type LASMesh = (typeof LASWorkerLoader)['dataType'];

const INITIAL_VIEW_STATE: OrbitViewState = {
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
  minZoom: 0,
  maxZoom: 10,
  zoom: 1 
};

const transitionInterpolator = new LinearInterpolator(['rotationOrbit']);



const LidarMapGL = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [viewState, updateViewState] = useState<OrbitViewState>(INITIAL_VIEW_STATE);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const rotateCamera = () => {
      updateViewState(v => ({
        ...v,
        rotationOrbit: v.rotationOrbit! + 120,
        transitionDuration: 2400,
        transitionInterpolator,
        onTransitionEnd: rotateCamera
      }));
    };
    rotateCamera();
  }, [isLoaded]);

  const onDataLoad = useCallback((data: any) => {
    const header = (data as LASMesh).header!;
    if (header.boundingBox) {
      const [mins, maxs] = header.boundingBox;
      updateViewState({
        ...INITIAL_VIEW_STATE,
        target: [(mins[0] + maxs[0]) / 2, (mins[1] + maxs[1]) / 2, (mins[2] + maxs[2]) / 2],
        zoom: Math.log2(window.innerWidth / (maxs[0] - mins[0])) - 1
      });
      setIsLoaded(true);
    }
  }, []);


  const layers = [
    new PointCloudLayer<LASMesh>({
      id: 'laz-point-cloud-layer',
      data: LAZ_URL,
      onDataLoad,
      getNormal: [0, 1, 0],
      getColor: [255, 255, 255],
      opacity: 0.5,
      pointSize: 0.5,
      loaders: [LASWorkerLoader]
    })
  ];

  return (
    <div style={{ position: 'relative', height: '800px', width: '100%', marginTop: '20px' }}>
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

export default LidarMapGL;