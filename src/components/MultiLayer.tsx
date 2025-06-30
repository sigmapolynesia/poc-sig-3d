import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import MapContainer from './MapContainer';
import { useWMTS } from '../hooks/useWMTS';
import { DEM_URL, GEOJSON_URL, MVT_URL, EXTRUSION_URL, WMTS_URL } from './config-ml';
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

    const protocol = new Protocol();
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
          "sky-horizon-blend": 0.1,      
        }, 
      },
      center,
      zoom,
      maxPitch: 75,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl());

    // Attendre que la carte soit entièrement chargée
    map.on('load', async () => {
      try {
        console.log('Map loaded, setting up layers...');
        
        // 1. DEM Topo + Bathy sur toute la Polynésie
        map.addSource("terrain", {
          type: "raster-dem",
          url: DEM_URL,
          "encoding": "mapbox",
        });

        map.addSource("hillshade", {
          type: "raster-dem",
          url: DEM_URL,
          "encoding": "mapbox",
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

        // 2. WMTS Te Fenua - seulement si les layers sont chargés
        if (layers.length > 0) {
          const wmtsLayer = layers.find(l => l.identifier === currentLayer);
          if (wmtsLayer) {
            console.log('Adding WMTS layer:', wmtsLayer.identifier);
            configureMapLibreWMTS(map, wmtsLayer, WMTS_URL);
          }
        }

        // 3. Extrusion de bâtiments via le format PMTiles
        map.addSource('protomaps', {
          type: 'vector',
          url: EXTRUSION_URL, 
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
            'fill-extrusion-opacity': 0.7
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
            "fill-color": "rgba(200, 163, 0, 0.5)",
            "fill-outline-color": "rgb(200, 180, 0)",
          },
          minzoom: 0,
          maxzoom: 22,
        });

        // 5. GeoJSON Test - parcelles avec transformation de coordonnées
        await loadAndTransformGeoJSON(map);
        
        console.log('All layers loaded successfully');
        
      } catch (error) {
        console.error('Error setting up map layers:', error);
      }
    });

    const loadAndTransformGeoJSON = async (mapInstance: maplibregl.Map) => {
      try {
        console.log('Loading GeoJSON from:', GEOJSON_URL);
        const res = await fetch(GEOJSON_URL);
        if (!res.ok) throw new Error(`Failed to load GeoJSON: ${res.status}`);
        
        const geojson = await res.json();
        console.log('GeoJSON loaded. CRS:', geojson.crs?.properties?.name);
        console.log('Number of features:', geojson.features?.length || 0);

        if (mapInstance.isStyleLoaded()) {
          configureMapLibreGeoJSON(mapInstance, 'parcelles-geojson', geojson, {
            transformCoordinates: true,
            fitBounds: true,
            sourceProjection: 'EPSG:3297'
          });
          console.log('GeoJSON configured and coordinates transformed');
        } else {
          mapInstance.once('styledata', () => {
            configureMapLibreGeoJSON(mapInstance, 'parcelles-geojson', geojson, {
              transformCoordinates: true,
              fitBounds: true,
              sourceProjection: 'EPSG:3297'
            });
            console.log('GeoJSON configured after style loaded');
          });
        }
      } catch (error) {
        console.error('Error loading and transforming GeoJSON:', error);
      }
    };

    return () => {
      maplibregl.removeProtocol("pmtiles");
      
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, currentLayer, layers, zoom]);

  useEffect(() => {
    if (mapRef.current && layers.length > 0 && mapRef.current.isStyleLoaded()) {
      const wmtsLayer = layers.find(l => l.identifier === currentLayer);
      if (wmtsLayer) {
        console.log('Updating WMTS layer to:', wmtsLayer.identifier);
        configureMapLibreWMTS(mapRef.current, wmtsLayer, WMTS_URL);
      }
    }
  }, [currentLayer, layers]);

  return <MapContainer ref={mapContainer} bg={'#87CEEB'}/>;
};

export default MultiLayer;