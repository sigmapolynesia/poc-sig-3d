import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapContainer from './MapContainer';
import { useWMTS } from '../hooks/useWMTS';
import { DEM_URL, GEOJSON_URL, MVT_URL, WMTS_URL } from './config-ml';
import { configureMapLibreWMTS, configureMapLibreGeoJSON  } from '../utils/maplibre-utils';
import { generateTMSTileUrl } from '../types/tms-parse.ts'

// const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

interface LayerProps {
  center?: [number, number];
  zoom?: number;
}

const MultiLayer: React.FC<LayerProps> = ({
  center = [-149.58, -17.67],
  zoom = 10.4,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const { 
    layers, 
    currentLayer, 
  } = useWMTS(
    WMTS_URL, 
    'TEFENUA:FOND',
  );

  useEffect(() => {
  if (!mapContainer.current || mapRef.current) return;

  const map = new maplibregl.Map({
    container: mapContainer.current,
    style: { version: 8, sources: {}, layers: [] },
    center,
    zoom,
  });

  map.addControl(new maplibregl.NavigationControl());

  map.on('load', async () => {

    // 1. DEM 
    map.addSource("terrain", {
      type: "raster-dem",
      url: DEM_URL,
    });

    map.addSource("hillshade", {
      type: "raster-dem",
      url: DEM_URL,
    });

    map.addLayer({
      id: "hillshade",
      type: "hillshade",
      source: "hillshade",
      layout: { visibility: "visible" },
      paint: {
        "hillshade-shadow-color": "#473B24",
        "hillshade-highlight-color": "#FAFAFF",
        "hillshade-accent-color": "#8B7355",
        "hillshade-illumination-direction": 315,
        "hillshade-illumination-anchor": "viewport",
        "hillshade-exaggeration": 0.35,
      },
    });

    map.setTerrain({
      source: "terrain",
      exaggeration: 1,
    });

    map.addLayer({
        id: "background-blue",
        type: "background",
        paint: {
            "background-color": "#312e9f",
        }
    });

    // 2. WMTS 
    const wmtsLayer = layers.find(l => l.identifier === currentLayer);
    if (wmtsLayer) {
      configureMapLibreWMTS(map, wmtsLayer, WMTS_URL);
    }

    /*
    // 3. OpenMapTiles - Extrusion
    map.addSource('openmaptiles', {
      type: 'vector',
      url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`,
      bounds: [
        -157.991444123,
        -31.231688228,
        -132.180691427,
        -4.991502196
      ],
    });

    map.addLayer({
      id: 'buildings-fill',
      type: 'fill-extrusion',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': [
          'case',
          ['has', 'colour'],
          ['get', 'colour'],
          '#aaa'
        ],
        'fill-extrusion-height': [
          'case',
          ['has', 'render_height'],
          ['get', 'render_height'],
          ['case',
            ['has', 'height'],
            ['get', 'height'],
            5 
          ]
        ],
        'fill-extrusion-base': [
          'case',
          ['has', 'render_min_height'],
          ['get', 'render_min_height'],
          0
        ],
        'fill-extrusion-opacity': 0.8
      }
    });

    map.addLayer({
      id: 'buildings-outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 15,
      paint: {
        'line-color': '#666',
        'line-width': 0.5,
        'line-opacity': 0.6
      }
    });
    */

    // 4. MVT 
    map.addSource("pga-source", {
      type: "vector",
      tiles: [generateTMSTileUrl(MVT_URL)],
      bounds: [-149.7, -17.8, -149.5, -17.6],
      minzoom: 0,
      maxzoom: 21,
    });

    map.addLayer({
      id: "pga-layer",
      type: "fill",
      source: "pga-source",
      "source-layer": "pga_zone_urba_v",
      paint: {
        "fill-color": "rgba(0, 100, 200, 0.5)",
        "fill-outline-color": "rgba(0, 100, 200, 1)",
      },
      minzoom: 0,
      maxzoom: 22,
    });

    // 5. GeoJSON
    try {
      const res = await fetch(GEOJSON_URL);
      if (!res.ok) throw new Error("Failed to load GeoJSON");
      const geojson = await res.json();

      configureMapLibreGeoJSON(map, 'default-geojson', geojson);
    } catch (e) {
      console.error(e);
    }
  });
}, [center, zoom, currentLayer, layers]);


  return <MapContainer ref={mapContainer} />;
};

export default MultiLayer;