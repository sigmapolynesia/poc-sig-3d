
export const calculateTileCoordinates = (
    lat: number,
    lon: number,
    zoom: number
  ): { x: number, y: number } => {
    const n = Math.pow(2, zoom);

    const x = Math.floor((lon + 180) / 360 * n);
    
    const y = Math.floor((90 - lat) / 180 * n);
    
    return { x, y };
  };
  
  export const calculateTileBoundingBox = (
    x: number,
    y: number,
    zoom: number
  ): { west: number, south: number, east: number, north: number } => {
    const n = Math.pow(2, zoom);
    
    const west = (x / n) * 360 - 180;
    const east = ((x + 1) / n) * 360 - 180;
    
    const north = 90 - (y / n) * 180;
    const south = 90 - ((y + 1) / n) * 180;
    
    return { west, south, east, north };
  };
  
  export const generateTileUrl = (
    baseUrl: string,
    x: number,
    y: number,
    z: number
  ): string => {
    return baseUrl
      .replace('{x}', x.toString())
      .replace('{y}', y.toString())
      .replace('{z}', z.toString());
  };