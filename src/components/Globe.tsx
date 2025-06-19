import React, { useRef, useState, useEffect } from 'react';
import Map, { NavigationControl, MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { ViewStateChangeEvent } from 'react-map-gl/maplibre';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

interface GlobeProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
  width?: string | number;
  height?: string | number;
  exaggeration?: number; 
  minZoomForTerrain?: number; 
}

const Globe: React.FC<GlobeProps> = ({
  initialViewState = {
    longitude: -149.5665,
    latitude: -17.5334,
    zoom: 9.5,
    pitch: 30, 
    bearing: 0,
  },
  width = '100%',
  height = '500px',
  exaggeration = 1.5, 
  minZoomForTerrain = 12, 
}) => {
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState(initialViewState);
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const [terrainEnabled, setTerrainEnabled] = useState(initialViewState.zoom >= minZoomForTerrain);
  const [isGlobeProjection, setIsGlobeProjection] = useState(true);

  const openVectorTileSources = {
    streets: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
    basic: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
    satellite: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`,
  };

  const selectedMapStyle = openVectorTileSources.streets;

  useEffect(() => {
    if (mapIsLoaded && mapRef.current) {
      const map = mapRef.current.getMap();

      if (!map.getSource('terrain-3d')) {
        map.addSource('terrain-3d', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_KEY}`,
          tileSize: 256
        });
      }

      if (!map.getSource('terrain-hillshade')) {
        map.addSource('terrain-hillshade', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_KEY}`,
          tileSize: 256
        });
      }

      if (!map.getLayer('hillshading')) {
        try {
          const availableLayers = map.getStyle().layers.map(layer => layer.id);
          const beforeLayerId = availableLayers.find(id => id.includes('label') || id.includes('place'));
          
          map.addLayer({
            id: 'hillshading',
            source: 'terrain-hillshade', 
            type: 'hillshade',
            paint: {
              'hillshade-illumination-direction': 315,
              'hillshade-exaggeration': 0.2
            },
            layout: {
              visibility: 'none'
            }
          }, beforeLayerId || undefined);
        } catch {
          map.addLayer({
            id: 'hillshading',
            source: 'terrain-hillshade',
            type: 'hillshade',
            paint: {
              'hillshade-illumination-direction': 315,
              'hillshade-exaggeration': 0.2
            },
            layout: {
              visibility: 'none'
            }
          });
        }
      }

      if (map.getLayer('hillshading')) {
        const shouldShowHillshade = viewState.zoom >= 12;
        map.setLayoutProperty('hillshading', 'visibility', shouldShowHillshade ? 'visible' : 'none');
      }

      if (terrainEnabled) {
        map.setTerrain({
          source: 'terrain-3d', 
          exaggeration: exaggeration
        });
      } else {
        map.setTerrain(null);
      }
    }
  }, [mapIsLoaded, exaggeration, terrainEnabled, viewState.zoom]);

  const handleViewStateChange = (evt: ViewStateChangeEvent) => {
    const newViewState = evt.viewState;
    setViewState(newViewState);
    
    const shouldEnableTerrain = newViewState.zoom >= minZoomForTerrain;
    if (shouldEnableTerrain !== terrainEnabled) {
      setTerrainEnabled(shouldEnableTerrain);
    }
  };

  const toggleProjection = () => {
    setIsGlobeProjection(!isGlobeProjection);
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      setTimeout(() => {
        map.resize();
      }, 100);
    }
  };

  return (
    <div style={{ width, height, position: 'relative' }}>
      <Map
        ref={(instance) => {
          mapRef.current = instance;
        }}
        mapLib={maplibregl}
        mapStyle={selectedMapStyle}
        {...viewState}
        onMove={handleViewStateChange}
        projection={isGlobeProjection ? "globe" : "mercator"}
        onLoad={() => setMapIsLoaded(true)}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
      </Map>
      
      {/* Bouton pour changer de projection */}
      <div 
        onClick={toggleProjection}
        style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          backgroundColor: 'white', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isGlobeProjection ? '2D' : '3D'}
      </div>
      
      {terrainEnabled ? (
        <div style={{ 
          position: 'absolute', 
          bottom: '10px', 
          left: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 0.7)', 
          padding: '5px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Relief activé
        </div>
      ) : (
        <div style={{ 
          position: 'absolute', 
          bottom: '10px', 
          left: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 0.7)', 
          padding: '5px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Zoom {minZoomForTerrain}+ pour voir le relief
        </div>
      )}
    </div>
  );
};

export default Globe;