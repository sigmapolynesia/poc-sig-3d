import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  ActionIcon,
  CheckIcon,
  Combobox,
  Group,
  InputBase,
  Loader,
  useCombobox
} from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { WMTSLayer } from '../../types/wmts.ts'

interface WMTSMapGLProps {
  width?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
  selectedLayer?: string;
}

const WMTSMapGL: React.FC<WMTSMapGLProps> = ({
  width = '100%',
  height = '950px',
  center = [-149.57, -17.67],
  zoom = 9,
  selectedLayer = 'TEFENUA:FOND_LEGER_v1'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [layers, setLayers] = useState<WMTSLayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLayer, setCurrentLayer] = useState<string>(selectedLayer);
  
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === 'keyboard') {
        combobox.selectActiveOption();
      } else {
        combobox.updateSelectedOptionIndex('active');
      }
    },
  });

  const parseWMTSCapabilities = (xmlData: string) => {
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

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://www.tefenua.gov.pf/api/wmts?request=GetCapabilities');
        if (!response.ok) throw new Error();
        
        const xmlData = await response.text();
        const parsedLayers = parseWMTSCapabilities(xmlData);
        
        const filteredLayers = parsedLayers.filter(layer => 
          layer.title === "Fond Léger" || layer.title === "FOND Tefenua"
        );
        
        setLayers(filteredLayers);
        
        if (filteredLayers.length > 0 && !filteredLayers.some(l => l.identifier === currentLayer)) {
          setCurrentLayer(filteredLayers[0].identifier);
        }
      } catch (e) {
        setError('Impossible de charger les informations du service WMTS');
      } finally {
        setLoading(false);
      }
    };

    fetchCapabilities();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current || loading) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: { version: 8, sources: {}, layers: [] },
      center,
      zoom
    });

    map.current.on('load', () => addWMTSLayer(currentLayer));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [loading]);

  useEffect(() => {
    if (!map.current || !map.current.loaded() || loading) return;
    addWMTSLayer(currentLayer);
  }, [currentLayer, layers]);

  const addWMTSLayer = (layerId: string) => {
    if (!map.current || layers.length === 0) return;

    const layer = layers.find(l => l.identifier === layerId);
    if (!layer) return;

    if (map.current.getSource('wmts-source')) {
      map.current.removeLayer('wmts-layer');
      map.current.removeSource('wmts-source');
    }

    const tileUrl = `https://www.tefenua.gov.pf/api/wmts?service=WMTS&request=GetTile&version=1.0.0&layer=${layer.identifier}&style=${layer.style || 'default'}&format=${layer.format}&tileMatrixSet=${layer.tileMatrixSet}&tileMatrix={z}&tileRow={y}&tileCol={x}`;

    map.current.addSource('wmts-source', {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      attribution: '© Tefenua - Polynésie française'
    });

    map.current.addLayer({
      id: 'wmts-layer',
      type: 'raster',
      source: 'wmts-source',
      layout: { visibility: 'visible' }
    });
  };

  const reloadCurrentLayer = () => {
    if (map.current && map.current.loaded()) {
      addWMTSLayer(currentLayer);
    }
  };

  const getLayerTitleById = (id: string): string => {
    const layer = layers.find(l => l.identifier === id);
    return layer ? layer.title : id;
  };

  return (
    <div style={{ width, height: 'auto', display: 'flex', flexDirection: 'column' }}>
      {loading ? (
        <Loader c="blue" size="xl" />
      ) : error ? (
        <div style={{ padding: '20px', color: 'red' }}>{error}</div>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
            <Group>
            <Combobox
              store={combobox}
              resetSelectionOnOptionHover
              onOptionSubmit={(val) => {
                const selectedLayer = layers.find(l => l.title === val);
                if (selectedLayer) {
                  setCurrentLayer(selectedLayer.identifier);
                }
                combobox.updateSelectedOptionIndex('active');
                combobox.closeDropdown();
              }}
            >
              <Combobox.Target targetType="button">
                <InputBase
                  mt={20}
                  mb={10}
                  maw={200}
                  component="button"
                  type="button"
                  pointer
                  rightSection={<Combobox.Chevron />}
                  rightSectionPointerEvents="none"
                  onClick={() => combobox.toggleDropdown()}
                  style={{ minWidth: '250px' }}
                >
                  {getLayerTitleById(currentLayer)}
                </InputBase>
              </Combobox.Target>

              <Combobox.Dropdown>
                
                <Combobox.Options>
                  <Combobox.Group label="Te Fenua">
                    {layers.map((layer) => (
                      <Combobox.Option 
                        value={layer.title} 
                        key={layer.identifier}
                        active={layer.identifier === currentLayer}
                      >
                        <Group gap="xs">
                          {layer.identifier === currentLayer && <CheckIcon size={12} />}
                          <span>{layer.title}</span>
                        </Group>
                      </Combobox.Option>
                    ))}
                  </Combobox.Group>
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
            <ActionIcon mt={10} variant="subtle" color="rgba(0, 0, 0, 1)" onClick={reloadCurrentLayer}>
              <IconRefresh style={{ width: '70%', height: '70%' }} stroke={1.5} />
            </ActionIcon>
            </Group>
          </div>
          <div ref={mapContainer} style={{ width: '100%', height, borderRadius: '4px' }} />
        </>
      )}
    </div>
  );
};

export default WMTSMapGL;