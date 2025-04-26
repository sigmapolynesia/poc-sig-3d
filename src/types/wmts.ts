export interface WMTSLayer {
  title: string;
  identifier: string;
  format: string;
  tileMatrixSet: string;
  style?: string;
}