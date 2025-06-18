import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import MapContainer from './MapContainer';
import { useWMTS } from '../hooks/useWMTS';
import { DEM_URL, GEOJSON_URL, MVT_URL, PMTILES_URL, WMTS_URL } from './config-ml';
import { configureMapLibreWMTS, configureMapLibreGeoJSON  } from '../utils/maplibre-utils';
import { generateTMSTileUrl } from '../types/tms-parse.ts'

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

  let protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);

  const map = new maplibregl.Map({
    container: mapContainer.current,
    style: { 
      version: 8, 
      sources: {}, 
      layers: [
        {
          id: "background-blue",
          type: "background",
          paint: {
            "background-color": "#87CEEB", 
          },
        },
      ],
      sky: {
            "sky-color": "#87CEEB",        
            "horizon-color": "#B0E0E6",     
            "sky-horizon-blend": 1,      
          } },
      center,
      zoom,
      maxPitch: 82,
  });

  mapRef.current = map;
  map.addControl(new maplibregl.NavigationControl());

  map.on('load', async () => {

    // 1. DEM Topo + Bathy sur tout la Polynésie
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

    // 2. WMTS Te Fenua
    const wmtsLayer = layers.find(l => l.identifier === currentLayer);
    if (wmtsLayer) {
      configureMapLibreWMTS(map, wmtsLayer, WMTS_URL);
    }

    // 3. Extrusion de bâtiments via Tileserver-GL - format -> PMTiles
    map.addSource('protomaps', {
      type: 'vector',
      url: PMTILES_URL, 
    });

    map.addLayer({
      id: 'buildings-fill',
      type: 'fill-extrusion',
      source: 'protomaps',
      'source-layer': 'building',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#e9dfad',
        'fill-extrusion-height': [
          'case',
          ['has', 'height'],
          ['get', 'height'],
          5 
        ],
        'fill-extrusion-base': [
          'case',
          ['has', 'min_height'],
          ['get', 'min_height'],
          0
        ],
        'fill-extrusion-opacity': 0.8
      }
    });

    // 4. MVT sur Paea
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

    // 5. GeoJSON Test - îles du Vent 
    try {
      const res = await fetch(GEOJSON_URL);
      if (!res.ok) throw new Error("Failed to load GeoJSON");
      const geojson = await res.json();

      configureMapLibreGeoJSON(map, 'default-geojson', geojson);
    } catch (e) {
      console.error(e);
    }
  });

  return () => {
    maplibregl.removeProtocol("pmtiles");
    
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };
}, [center, zoom, currentLayer, layers]);


  return <MapContainer ref={mapContainer} bg={'#87CEEB'}/>;
};

export default MultiLayer;