import { useState, useEffect, useCallback, useRef } from 'react';
import { WMTSLayer } from '../types/wmts';
import { fetchWMTSCapabilities } from '../types/wmts-parse';

type UseWMTSResult = {
  layers: WMTSLayer[];
  currentLayer: string;
  setCurrentLayer: (layerId: string) => void;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Hook personnalisé pour gérer les couches WMTS
 * @param url - URL du service WMTS
 * @param initialLayer - Identifiant de la couche initiale
 * @param layerFilter - Fonction optionnelle pour filtrer les couches
 */
export const useWMTS = (
  url: string,
  initialLayer: string,
  layerFilter?: (layers: WMTSLayer[]) => WMTSLayer[]
): UseWMTSResult => {
  const [layers, setLayers] = useState<WMTSLayer[]>([]);
  const [currentLayer, setCurrentLayer] = useState<string>(initialLayer);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Référence stable pour le layerFilter
  const layerFilterRef = useRef(layerFilter);
  layerFilterRef.current = layerFilter;

  // Mémoriser la fonction de filtrage pour éviter les re-renders inutiles
  const stableLayerFilter = useCallback((layers: WMTSLayer[]) => {
    return layerFilterRef.current ? layerFilterRef.current(layers) : layers;
  }, []);

  useEffect(() => {
    const loadCapabilities = async () => {
      try {
        setIsLoading(true);
        const parsedLayers = await fetchWMTSCapabilities(url);
        
        const processedLayers = stableLayerFilter(parsedLayers);
        
        setLayers(processedLayers);
        
        if (processedLayers.length > 0 && !processedLayers.some(l => l.identifier === initialLayer)) {
          setCurrentLayer(processedLayers[0].identifier);
        } else if (processedLayers.length > 0) {
          setCurrentLayer(initialLayer);
        }
        
        setError(null);
      } catch (e) {
        console.error("Impossible de charger les informations du service WMTS", e);
        setError(e instanceof Error ? e : new Error("Erreur inconnue lors du chargement du WMTS"));
      } finally {
        setIsLoading(false);
      }
    };

    loadCapabilities();
  }, [url, initialLayer, stableLayerFilter]); 

  return {
    layers,
    currentLayer,
    setCurrentLayer,
    isLoading,
    error
  };
};