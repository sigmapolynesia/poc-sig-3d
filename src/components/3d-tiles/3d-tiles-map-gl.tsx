import { useRef, useState } from 'react';
import type { Tileset3D } from '@loaders.gl/tiles';
import {Tiles3DLoader} from '@loaders.gl/3d-tiles';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { Map, useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { DeckProps, MapViewState } from '@deck.gl/core';
import { TILESET_URL } from './config';
import 'maplibre-gl/dist/maplibre-gl.css';


function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
};

type DataProps = {
  color: [r: number, g: number, b: number];
};

const DTilesMapGL = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [initialViewState, setInitialViewState] = useState<MapViewState>({
    longitude: -140.168868,
    latitude: -8.863563,
    zoom: 16.5
  });

  const layers = [
    new Tile3DLayer({
      id: '3DTilesLayer',
      data: TILESET_URL,
      pointSize: 0.2,
      loader: Tiles3DLoader,
      loadOptions: {
        '3d-tiles': {
          decodeQuantizedPositions: true
        }
      },

      onTilesetLoad: (tileset: Tileset3D) => {
        const {cartographicCenter, zoom} = tileset;
        if (cartographicCenter) {
          setInitialViewState({
            longitude: cartographicCenter[0],
            latitude: cartographicCenter[1],
            zoom
          });
        }
      },
      getColor: (point: DataProps) => point.color,
    })
  ];

  return (
    <div style={{ position: 'relative', height: '1000px', width: '100%', marginTop: '20px' }} ref={mapContainer}>
      <Map
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
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

export default DTilesMapGL;