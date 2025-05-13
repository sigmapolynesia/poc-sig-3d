import { TMSLayerOptions } from './tms';

export const generateTMSTileUrl = (layer: TMSLayerOptions): string => {
    return `${layer.host}/geoserver/gwc/service/tms/1.0.0/${layer.identifier}@WebMercatorQuad@pbf/{z}/{x}/{y}.pbf?flipy=true`;
  };  