import { useEffect, useRef, useState, useCallback } from 'react';
import MapContainer from '../MapContainer';
import MVTLayerSelector, { LayerInfo, LayerValues, ValueCount } from './mvt-layer-selector';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';
import { Box, Flex } from '@mantine/core';
import { VectorTile } from '@mapbox/vector-tile';
import Pbf from 'pbf';

const CSS_COLORS = [
  '#1f78b4', '#33a02c', '#e31a1c', '#ff7f00', 'hsl(90,50%,30%)',
  '#fb9a99', '#cab2d6', '#fdbf6f', 'hsl(240,90%,60%)', '#6a3d9a',
  '#bb5', '#b15928', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#00ffff', '#ff00ff', '#800000', '#008000', '#000080', '#808000',
  '#008080', '#800080', '#808080'
];

const Test = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [layerValues, setLayerValues] = useState<LayerValues>({});
  const [focusedAttribute, setFocusedAttribute] = useState<string>();
  const [focusedLayer, setFocusedLayer] = useState<string>();
  const [focusedValue, setFocusedValue] = useState<any>();
  const [valueCounts, setValueCounts] = useState<ValueCount[]>([]);
  const [tileUrl, setTileUrl] = useState<string>('');
  const [, setIsZyx] = useState<boolean>(false);
  const [showTileBoundaries, setShowTileBoundaries] = useState<boolean>(false);
  
  const handleUrlChange = useCallback((url: string, isCorsEnabled: boolean, zyx: boolean) => {
    if (!url) return;
    
    setIsZyx(zyx);
    const tileUrlTemplate = url.replace(
      /([/=])\d+\/\d+\/\d+/,
      zyx ? '$1{z}/{y}/{x}' : '$1{z}/{x}/{y}'
    );
    
    setTileUrl(tileUrlTemplate);
    
    if (url.match(/\d+\/\d+\/\d+/)) {
      fetchSingleTile(url, isCorsEnabled);
    } 
    else if (url.match(/\.json/)) {
      fetchTileJSON(url, isCorsEnabled);
    }
  }, []);

  const handleToggleTileBoundaries = useCallback((show: boolean) => {
    setShowTileBoundaries(show);
    if (mapRef.current) {
      mapRef.current.showTileBoundaries = show;
    }
  }, []);

  const fetchSingleTile = async (url: string, useCors: boolean) => {
    try {
      const response = await axios.get(useCors ? `https://cors-anywhere.herokuapp.com/${url}` : url, {
        responseType: 'arraybuffer',
        headers: useCors ? { Origin: window.location.host } : undefined
      });
      
      let data = new Uint8Array(response.data);
      
      const tile = new VectorTile(new Pbf(data));
      
      const layerInfo: LayerInfo[] = Object.keys(tile.layers).map((layerId, index) => {
        const layer = tile.layers[layerId];
        const keys: string[] = [];
        
        for (let i = 0; i < layer.length; i++) {
          const feature = layer.feature(i);
          Object.keys(feature.properties).forEach(key => {
            if (!keys.includes(key)) {
              keys.push(key);
            }
          });
        }
        
        return {
          id: layerId,
          sourceLayer: layerId,
          color: CSS_COLORS[index % CSS_COLORS.length],
          keys: keys
        };
      });
      
      setLayers(layerInfo);
      setupMap(layerInfo);
      
    } catch (error) {
      console.error("Error fetching tile:", error);
    }
  };

  const fetchTileJSON = async (url: string, useCors: boolean) => {
    try {
      const response = await axios.get(useCors ? `https://cors-anywhere.herokuapp.com/${url}` : url, {
        headers: useCors ? { Origin: window.location.host } : undefined
      });
      
      const tileJSON = response.data;
      
      if (tileJSON.vector_layers) {
        const layerInfo: LayerInfo[] = tileJSON.vector_layers.map((layer: any, index: number) => ({
          id: layer.id,
          sourceLayer: layer.id,
          color: CSS_COLORS[index % CSS_COLORS.length],
          keys: Object.keys(layer.fields || {})
        }));
        
        setLayers(layerInfo);
        setTileUrl(tileJSON.tiles[0]);
        setupMap(layerInfo);
        
        if (tileJSON.center && Array.isArray(tileJSON.center) && tileJSON.center.length >= 2) {
          mapRef.current?.flyTo({
            center: [tileJSON.center[0], tileJSON.center[1]],
            zoom: tileJSON.center[2] || 1
          });
        }
      }
    } catch (error) {
      console.error("Error fetching TileJSON:", error);
    }
  };

  const setupMap = useCallback((layerInfo: LayerInfo[]) => {
    if (!mapRef.current || !tileUrl) return;
    
    const map = mapRef.current;
    
    if (map.getSource('mvt-source')) {
      layerInfo.forEach(layer => {
        if (map.getLayer(`${layer.id}-fill`)) map.removeLayer(`${layer.id}-fill`);
        if (map.getLayer(`${layer.id}-line`)) map.removeLayer(`${layer.id}-line`);
        if (map.getLayer(`${layer.id}-circle`)) map.removeLayer(`${layer.id}-circle`);
      });
      
      if (map.getLayer('focus-line')) map.removeLayer('focus-line');
      if (map.getLayer('focus-circle')) map.removeLayer('focus-circle');
      
      map.removeSource('mvt-source');
    }
    
    map.addSource('mvt-source', {
      type: 'vector',
      tiles: [tileUrl],
      scheme: 'xyz'
    });
    
    layerInfo.forEach(layer => {
      map.addLayer({
        id: `${layer.id}-fill`,
        source: 'mvt-source',
        'source-layer': layer.sourceLayer,
        type: 'fill',
        paint: {
          'fill-color': layer.color,
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.7,
            0.2
          ],
          'fill-outline-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            'black',
            'transparent'
          ]
        },
        filter: ['==', ['geometry-type'], 'Polygon']
      });
      
      map.addLayer({
        id: `${layer.id}-line`,
        source: 'mvt-source',
        'source-layer': layer.sourceLayer,
        type: 'line',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            'black',
            layer.color
          ],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            11, 1,
            14, 5
          ]
        },
        filter: ['any', 
          ['==', ['geometry-type'], 'LineString'],
          ['==', ['geometry-type'], 'Polygon']
        ]
      });
      
      map.addLayer({
        id: `${layer.id}-circle`,
        source: 'mvt-source',
        'source-layer': layer.sourceLayer,
        type: 'circle',
        paint: {
          'circle-color': layer.color,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            11, 2,
            14, 5
          ]
        },
        filter: ['==', ['geometry-type'], 'Point']
      });
      
      map.on('mousemove', `${layer.id}-fill`, (e) => {
        if (e.features && e.features.length > 0) {
          const values: LayerValues = {};
          values[layer.id] = e.features[0].properties;
          setLayerValues(prev => ({ ...prev, ...values }));
        }
      });
      
      map.on('mousemove', `${layer.id}-line`, (e) => {
        if (e.features && e.features.length > 0) {
          const values: LayerValues = {};
          values[layer.id] = e.features[0].properties;
          setLayerValues(prev => ({ ...prev, ...values }));
        }
      });
      
      map.on('mousemove', `${layer.id}-circle`, (e) => {
        if (e.features && e.features.length > 0) {
          const values: LayerValues = {};
          values[layer.id] = e.features[0].properties;
          setLayerValues(prev => ({ ...prev, ...values }));
        }
      });
      
      map.on('mouseenter', `${layer.id}-fill`, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      map.on('mouseleave', `${layer.id}-fill`, () => {
        map.getCanvas().style.cursor = '';
      });
    });
  }, [tileUrl]);

  const handleAttributeClick = useCallback((attribute: string, layer: string) => {
    setFocusedAttribute(attribute);
    setFocusedLayer(layer);
    updateAttributeSummary(attribute, layer);
  }, []);

  const updateAttributeSummary = useCallback((attribute: string, layer: string) => {
    if (!mapRef.current) return;
    
    const features = mapRef.current.querySourceFeatures('mvt-source', {
      sourceLayer: layer
    });
    
    const countMap = new Map<any, number[]>();
    
    features.forEach(feature => {
      const value = feature.properties?.[attribute];
      const geometryType = feature.geometry?.type;
      
      if (value !== undefined) {
        const counts = countMap.get(value) || [0, 0, 0, 0]; 
        counts[0] += 1; 
        
        if (geometryType === 'Point') counts[1] += 1;
        else if (geometryType === 'LineString') counts[2] += 1;
        else if (geometryType === 'Polygon') counts[3] += 1;
        
        countMap.set(value, counts);
      }
    });
    
    const valueCounts: ValueCount[] = Array.from(countMap.entries())
      .map(([value, [total, points, linestrings, polygons]]) => ({
        value, count: total, points, linestrings, polygons
      }))
      .sort((a, b) => b.count - a.count);
    
    setValueCounts(valueCounts);
  }, []);

  const handleValueHover = useCallback((value: any) => {
    setFocusedValue(value);
    
    if (!mapRef.current || !focusedLayer || !focusedAttribute) return;
    
    const map = mapRef.current;
    
    if (map.getLayer('focus-line')) map.removeLayer('focus-line');
    if (map.getLayer('focus-circle')) map.removeLayer('focus-circle');
    
    if (value !== undefined) {
      map.addLayer({
        id: 'focus-line',
        source: 'mvt-source',
        'source-layer': focusedLayer,
        type: 'line',
        paint: {
          'line-color': 'yellow',
          'line-width': 4,
          'line-opacity': 0.7
        },
        filter: ['==', ['get', focusedAttribute], value]
      });
      
      map.addLayer({
        id: 'focus-circle',
        source: 'mvt-source',
        'source-layer': focusedLayer,
        type: 'circle',
        paint: {
          'circle-color': 'yellow',
          'circle-radius': 12,
          'circle-opacity': 0.7
        },
        filter: [
          'all',
          ['==', ['get', focusedAttribute], value],
          ['==', ['geometry-type'], 'Point']
        ]
      });
    }
  }, [focusedLayer, focusedAttribute]);

  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster' as const,
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster' as const,
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ],
          glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
        },
        center: [0, 0],
        zoom: 2,
        hash: true 
      });
      
      map.addControl(new maplibregl.NavigationControl());
      map.addControl(new maplibregl.ScaleControl());
      
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        })
      );
      
      map.addControl(new maplibregl.FullscreenControl());
      
      map.showTileBoundaries = showTileBoundaries;
      
      class TileCoordinatesControl {
        private _map?: maplibregl.Map;
        private _container: HTMLDivElement;
        private _textContainer: HTMLDivElement;
        
        constructor() {
          this._container = document.createElement('div');
          this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
          
          this._textContainer = document.createElement('div');
          this._textContainer.className = 'tile-coordinates-text';
          this._textContainer.style.padding = '5px';
          this._textContainer.style.fontSize = '10px';
          this._textContainer.style.fontFamily = 'monospace';
          this._textContainer.style.color = '#333';
          this._textContainer.innerHTML = 'Hover over map';
          
          this._container.appendChild(this._textContainer);
        }
        
        onAdd(map: maplibregl.Map) {
          this._map = map;
          map.on('mousemove', this._onMouseMove.bind(this));
          return this._container;
        }
        
        onRemove() {
          if (this._map) {
            this._map.off('mousemove', this._onMouseMove.bind(this));
            this._map = undefined;
          }
        }
        
        _onMouseMove(e: maplibregl.MapMouseEvent) {
          if (!this._map) return;
          
          const zoom = Math.floor(this._map.getZoom());
          const { x, y } = this._map.project(e.lngLat);
          
          const globalTileX = Math.floor(x / 512 * Math.pow(2, zoom - 10));
          const globalTileY = Math.floor(y / 512 * Math.pow(2, zoom - 10));
          
          this._textContainer.innerHTML = `Zoom: ${zoom}<br>Tile: ${globalTileX}/${globalTileY}/${zoom}`;
        }
      }
      
      map.addControl(new TileCoordinatesControl());
      
      mapRef.current = map;
      
      return () => {
        map.remove();
        mapRef.current = null;
      };
    }
  }, [showTileBoundaries]);
  
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.showTileBoundaries = showTileBoundaries;
    }
  }, [showTileBoundaries]);

  return (
    <Flex style={{ height: 'calc(100vh - 200px)', marginTop: '20px' }}>
      <Box style={{ width: '300px', overflowY: 'auto', borderRight: '1px solid #eee' }}>
        <MVTLayerSelector 
          onUrlChange={handleUrlChange}
          layers={layers}
          layerValues={layerValues}
          onAttributeClick={handleAttributeClick}
          focusedAttribute={focusedAttribute}
          focusedLayer={focusedLayer}
          valueCounts={valueCounts}
          onValueHover={handleValueHover}
          focusedValue={focusedValue}
          showTileBoundaries={showTileBoundaries}
          onToggleTileBoundaries={handleToggleTileBoundaries}
        />
      </Box>
      <Box style={{ flexGrow: 1 }}>
        <MapContainer ref={mapContainer} style={{ height: '100%' }} />
      </Box>
    </Flex>
  );
};

export default Test;