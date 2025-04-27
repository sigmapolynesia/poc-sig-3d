import { WMTSLayer } from './wmts';

export const parseWMTSCapabilities = (xmlData: string): WMTSLayer[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, "text/xml");
  
  const getElementText = (element: Element | null): string => 
    element ? element.textContent || "" : "";
  
  const layerElements = xmlDoc.getElementsByTagName("Layer");
  const parsedLayers: WMTSLayer[] = [];
  
  for (let i = 0; i < layerElements.length; i++) {
    const layer = layerElements[i];
    
    const title = getElementText(layer.getElementsByTagName("ows:Title")[0]);
    const identifier = getElementText(layer.getElementsByTagName("ows:Identifier")[0]);
    const format = getElementText(layer.getElementsByTagName("Format")[0]);
    
    const styleElement = layer.getElementsByTagName("Style")[0];
    const style = getElementText(styleElement?.getElementsByTagName("ows:Identifier")[0]) || "default";
    
    let tileMatrixSet = "EPSG:900913";
    const tileMatrixSetLinkElements = layer.getElementsByTagName("TileMatrixSetLink");
    
    if (tileMatrixSetLinkElements.length > 0) {
      for (let j = 0; j < tileMatrixSetLinkElements.length; j++) {
        const tmsValue = getElementText(tileMatrixSetLinkElements[j].getElementsByTagName("TileMatrixSet")[0]);
        if (tmsValue === "EPSG:900913") {
          tileMatrixSet = "EPSG:900913";
          break;
        }
      }
      
      if (tileMatrixSet !== "EPSG:900913" && tileMatrixSetLinkElements.length > 0) {
        tileMatrixSet = getElementText(tileMatrixSetLinkElements[0].getElementsByTagName("TileMatrixSet")[0]);
      }
    }
    
    parsedLayers.push({ title, identifier, format, tileMatrixSet, style });
  }
  
  return parsedLayers;
};

export const fetchWMTSCapabilities = async (url: string): Promise<WMTSLayer[]> => {
  const response = await fetch(`${url}?request=GetCapabilities`);
  if (!response.ok) {
    throw new Error('Failed to fetch WMTS capabilities');
  }
  
  const xmlData = await response.text();
  return parseWMTSCapabilities(xmlData);
};

export const generateWMTSTileUrl = (baseUrl: string, layer: WMTSLayer): string => {
  return `${baseUrl}?service=WMTS&request=GetTile&version=1.0.0&layer=${layer.identifier}&style=${layer.style || 'default'}&format=${layer.format}&tileMatrixSet=${layer.tileMatrixSet}&tileMatrix={z}&tileRow={y}&tileCol={x}`;
};