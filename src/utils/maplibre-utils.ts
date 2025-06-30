import { WMTSLayer } from '../types/wmts';
import { generateWMTSTileUrl } from '../types/wmts-parse';
import maplibregl from 'maplibre-gl';
import proj4 from 'proj4';

proj4.defs('EPSG:3297', '+proj=utm +zone=6 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');


type Position = number[];
type LineStringCoordinates = Position[];
type PolygonCoordinates = Position[][];
type MultiPolygonCoordinates = Position[][][];
type Coordinates = Position | LineStringCoordinates | PolygonCoordinates | MultiPolygonCoordinates;

interface BaseGeometry {
  type: string;
  coordinates: Coordinates;
}

interface PointGeometry extends BaseGeometry {
  type: 'Point';
  coordinates: Coordinates;
}

interface LineStringGeometry extends BaseGeometry {
  type: 'LineString';
  coordinates: Coordinates;
}

interface PolygonGeometry extends BaseGeometry {
  type: 'Polygon';
  coordinates: Coordinates;
}

interface MultiPointGeometry extends BaseGeometry {
  type: 'MultiPoint';
  coordinates: Coordinates;
}

interface MultiLineStringGeometry extends BaseGeometry {
  type: 'MultiLineString';
  coordinates: Coordinates;
}

interface MultiPolygonGeometry extends BaseGeometry {
  type: 'MultiPolygon';
  coordinates: Coordinates;
}

type Geometry = PointGeometry | LineStringGeometry | PolygonGeometry | 
                MultiPointGeometry | MultiLineStringGeometry | MultiPolygonGeometry;

interface GeoJSONFeature {
  type: 'Feature';
  geometry: Geometry | null;
  properties: Record<string, unknown> | null;
  id?: string | number;
}

interface CRS {
  type: "name";
  properties: {
    name: string;
  };
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  crs?: CRS;
}

interface ConfigureGeoJSONOptions {
  transformCoordinates?: boolean;
  fitBounds?: boolean;
  sourceProjection?: string;
}

export const transformPoint = (point: Position): Position => {
  try {
    const [x, y, z] = point;
    const [lon, lat] = proj4('EPSG:3297', 'EPSG:4326', [x, y]);
    return z !== undefined ? [lon, lat, z] : [lon, lat];
  } catch (error) {
    console.error('Erreur lors de la transformation du point:', point, error);
    return point; 
  }
};

const isPoint = (coordinates: unknown): coordinates is Position => {
  return Array.isArray(coordinates) && 
         coordinates.length >= 2 && 
         typeof coordinates[0] === 'number' && 
         typeof coordinates[1] === 'number';
};

export const transformCoordinates = (coordinates: Coordinates): Coordinates => {
  if (!Array.isArray(coordinates)) {
    return coordinates;
  }

  if (isPoint(coordinates)) {
    return transformPoint(coordinates);
  }

  return coordinates.map((coord) => transformCoordinates(coord as Coordinates)) as Coordinates;
};

export const transformFeature = (feature: GeoJSONFeature): GeoJSONFeature => {
  if (!feature || !feature.geometry) {
    return feature;
  }

  return {
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: transformCoordinates(feature.geometry.coordinates)
    }
  };
};

const hasCrs = (obj: unknown): obj is { crs: CRS } => {
  return typeof obj === 'object' && 
         obj !== null && 
         'crs' in obj && 
         typeof (obj as { crs?: unknown }).crs === 'object' &&
         (obj as { crs: unknown }).crs !== null &&
         'properties' in (obj as { crs: { properties?: unknown } }).crs &&
         typeof (obj as { crs: { properties: unknown } }).crs.properties === 'object' &&
         (obj as { crs: { properties: unknown } }).crs.properties !== null &&
         'name' in (obj as { crs: { properties: { name?: unknown } } }).crs.properties &&
         typeof (obj as { crs: { properties: { name: unknown } } }).crs.properties.name === 'string';
};

export const transformGeoJSON = (geojson: GeoJSONFeatureCollection): GeoJSONFeatureCollection => {
  if (!geojson || geojson.type !== 'FeatureCollection') {
    console.error('Le GeoJSON doit être un FeatureCollection');
    return geojson;
  }

  return {
    ...geojson,
    crs: {
      type: "name",
      properties: {
        name: "EPSG:4326"
      }
    },
    features: geojson.features.map(transformFeature)
  };
};

const updateBounds = (
  coordinates: Coordinates, 
  bounds: { minLon: number; minLat: number; maxLon: number; maxLat: number }
): void => {
  if (isPoint(coordinates)) {
    const [lon, lat] = coordinates;
    bounds.minLon = Math.min(bounds.minLon, lon);
    bounds.minLat = Math.min(bounds.minLat, lat);
    bounds.maxLon = Math.max(bounds.maxLon, lon);
    bounds.maxLat = Math.max(bounds.maxLat, lat);
  } else if (Array.isArray(coordinates)) {
    coordinates.forEach(coord => updateBounds(coord as Coordinates, bounds));
  }
};

export const calculateBounds = (geojson: GeoJSONFeatureCollection): [number, number, number, number] => {
  const bounds = {
    minLon: Infinity,
    minLat: Infinity,
    maxLon: -Infinity,
    maxLat: -Infinity
  };

  geojson.features?.forEach((feature) => {
    if (feature.geometry?.coordinates) {
      updateBounds(feature.geometry.coordinates, bounds);
    }
  });

  return [bounds.minLon, bounds.minLat, bounds.maxLon, bounds.maxLat];
};

export const configureMapLibreWMTS = (
  map: maplibregl.Map, 
  layer: WMTSLayer, 
  baseUrl: string
): void => {
  if (!map || !layer) return;

  if (map.getSource('wmts-source')) {
    map.removeLayer('wmts-layer');
    map.removeSource('wmts-source');
  }

  const tileUrl = generateWMTSTileUrl(baseUrl, layer);

  map.addSource('wmts-source', {
    type: 'raster',
    tiles: [tileUrl],
    tileSize: 256,
    attribution: '© Tefenua - Polynésie française'
  });

  map.addLayer({
    id: 'wmts-layer',
    type: 'raster',
    source: 'wmts-source',
    layout: { visibility: 'visible' }
  });
};

export const posTahiti = {
  lat: -17.67,
  lon: -149.43,
} as const;

export const maplibreCenter = (
  map: maplibregl.Map, 
  zoom: number = 9.15
): void => {
  if (!map) return;
  
  map.setCenter([posTahiti.lon, posTahiti.lat]);
  map.setZoom(zoom);
};

export const configureMapLibreGeoJSON = (
  map: maplibregl.Map,
  sourceId: string = 'default-geojson',
  data: GeoJSON.GeoJSON,
  options: ConfigureGeoJSONOptions = {}
): void => {
  if (!map) {
    console.error('Map instance is undefined');
    return;
  }
  
  if (!map.isStyleLoaded()) {
    console.warn('Map style not loaded yet, cannot configure GeoJSON');
    return;
  }
  
  const { 
    transformCoordinates = true, 
    fitBounds = true,
    sourceProjection = 'EPSG:3297'
  } = options;
  
  let processedData: GeoJSON.GeoJSON = data;

  if (transformCoordinates && 
      hasCrs(data) && data.crs.properties.name === sourceProjection &&
      data.type === 'FeatureCollection') {
    console.log('Transformation des coordonnées de', sourceProjection, 'vers EPSG:4326');
    processedData = transformGeoJSON(data as GeoJSONFeatureCollection) as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  }
  
  if (map.getSource(sourceId)) {
    const layerIds = [
      `${sourceId}-polygons`,
      `${sourceId}-polygon-outlines`, 
      `${sourceId}-lines`,
      `${sourceId}-points`
    ];
    
    layerIds.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    });
    
    map.removeSource(sourceId);
  }
  
  map.addSource(sourceId, {
    type: 'geojson',
    data: processedData
  });
  
  map.addLayer({
    id: `${sourceId}-polygons`,
    type: 'fill',
    source: sourceId,
    paint: {
      'fill-color': 'rgba(100, 149, 237, 0.4)',
      'fill-outline-color': '#0080ff',
    },
    filter: ['==', '$type', 'Polygon']
  });
  
  map.addLayer({
    id: `${sourceId}-polygon-outlines`,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': '#0080ff',
      'line-width': 2, 
    },
    filter: ['==', '$type', 'Polygon']
  });
  
  map.addLayer({
    id: `${sourceId}-lines`,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': '#0080ff',
      'line-width': 2
    },
    filter: ['==', '$type', 'LineString']
  });
  
  map.addLayer({
    id: `${sourceId}-points`,
    type: 'circle',
    source: sourceId,
    paint: {
      'circle-radius': 5,
      'circle-color': '#ff7800',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    },
    filter: ['==', '$type', 'Point']
  });

  if (fitBounds &&
      processedData.type === 'FeatureCollection' &&
      Array.isArray((processedData as GeoJSON.FeatureCollection).features) &&
      (processedData as GeoJSON.FeatureCollection).features.length > 0) {
    try {
      const bounds = calculateBounds(processedData as GeoJSONFeatureCollection);
      map.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 16 
      });
    } catch (error) {
      console.error('Erreur lors du calcul des bounds:', error);
    }
  }
};