import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, Checkbox, Text, Box, Title, Stack, Table, Group, Button } from '@mantine/core';

export interface LayerInfo {
  id: string;
  sourceLayer: string;
  color: string;
  keys: string[];
}

export interface AttributeValue {
  [key: string]: any;
}

export interface LayerValues {
  [layerName: string]: AttributeValue;
}

export interface ValueCount {
  value: any;
  count: number;
  points: number;
  linestrings: number;
  polygons: number;
}

interface MVTLayerSelectorProps {
  onUrlChange: (url: string, isCorsEnabled: boolean, isZyx: boolean) => void;
  layers: LayerInfo[];
  layerValues: LayerValues;
  onAttributeClick: (attribute: string, layer: string) => void;
  focusedAttribute?: string;
  focusedLayer?: string;
  valueCounts: ValueCount[];
  onValueHover: (value: any) => void;
  focusedValue?: any;
  showTileBoundaries?: boolean;
  onToggleTileBoundaries?: (show: boolean) => void;
}

const MVTLayerSelector: React.FC<MVTLayerSelectorProps> = ({
  onUrlChange,
  layers,
  layerValues,
  onAttributeClick,
  focusedAttribute,
  focusedLayer,
  valueCounts,
  onValueHover,
  focusedValue,
  showTileBoundaries = false,
  onToggleTileBoundaries
}) => {
  const [url, setUrl] = useState<string>('');
  const [corsEnabled, setCorsEnabled] = useState<boolean>(false);
  const [isZyx, setIsZyx] = useState<boolean>(false);
  const [collapsedLayers, setCollapsedLayers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const hashUrl = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('url');
    if (hashUrl) {
      setUrl(hashUrl);
    } else {
      const savedUrl = localStorage.getItem('mvt-inspector-url');
      if (savedUrl) {
        setUrl(savedUrl);
      }
    }

    setIsZyx(window.location.hash.includes('zyx'));
  }, []);

  useEffect(() => {
    if (url) {
      localStorage.setItem('mvt-inspector-url', url);
      onUrlChange(url, corsEnabled, isZyx);
      
      const params = new URLSearchParams();
      params.set('url', url);
      if (isZyx) {
        params.set('zyx', 'true');
      }
      window.location.hash = params.toString();
    }
  }, [url, corsEnabled, isZyx, onUrlChange]);

  const toggleLayerCollapse = useCallback((layerId: string) => {
    setCollapsedLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  }, []);

  const handleTileBoundariesToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onToggleTileBoundaries) {
      onToggleTileBoundaries(e.currentTarget.checked);
    }
  };

  return (
    <Box p="md">
      <Stack gap="md">
        <Title order={3}>Vector Inspector</Title>
        <Text size="sm">
          Look inside the contents of vector tiles from third party sources!
        </Text>
        <Text size="xs" color="dimmed">
          Paste the URL of one vector tile (.../8/531/489.pbf) OR a TileJSON endpoint (.../index.json)
        </Text>
        
        <TextInput
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://tiles.planninglabs.nyc/data/v3/14/4826/6157.pbf"
          size="sm"
        />
        
        <Group gap="md">
          <Checkbox
            label="Use CORS proxy"
            checked={corsEnabled}
            onChange={(e) => setCorsEnabled(e.currentTarget.checked)}
            size="xs"
          />
          <Checkbox
            label="URL is Z/Y/X (not Z/X/Y)"
            checked={isZyx}
            onChange={(e) => setIsZyx(e.currentTarget.checked)}
            size="xs"
          />
        </Group>

        <Checkbox
          label="Show tile boundaries"
          checked={showTileBoundaries}
          onChange={handleTileBoundariesToggle}
          size="xs"
        />

{layers.length > 0 && (
  <>
    <Title order={4}>Layers</Title>
    {layers.map(layer => (
      <Box key={layer.id} mb="sm">
        <Button
          variant="subtle"
          onClick={() => toggleLayerCollapse(layer.id)}
          style={{ color: layer.color, fontWeight: 'bold', padding: '2px 8px', fontSize: '0.875rem' }}
        >
          {layer.id} {collapsedLayers[layer.id] ? '►' : '▼'}
        </Button>
        <Text size="xs" color="dimmed">
          Source Layer: {layer.sourceLayer}
        </Text>
        {!collapsedLayers[layer.id] && (
          <Table style={{ fontSize: '0.75rem' }} highlightOnHover>
            <tbody>
              {layer.keys.map(key => (
                <tr
                  key={key}
                  onClick={() => onAttributeClick(key, layer.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ width: '20px' }}>
                    {key === focusedAttribute && focusedLayer === layer.id && '→'}
                  </td>
                  <td>{key}</td>
                  <td>
                    {layerValues[layer.id] && layerValues[layer.id][key] !== undefined
                      ? String(layerValues[layer.id][key])
                      : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Box>
    ))}
  </>
)}


        {focusedAttribute && valueCounts.length > 0 && (
          <>
            <Title order={4}>Values of "{focusedAttribute}"</Title>
            <Table style={{ fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '20px' }}></th>
                  <th>Value</th>
                  <th>Count</th>
                  <th style={{ width: '30px' }}>Pt</th>
                  <th style={{ width: '30px' }}>Ln</th>
                  <th style={{ width: '30px' }}>Po</th>
                </tr>
              </thead>
              <tbody>
                {valueCounts.map(({ value, count, points, linestrings, polygons }) => (
                  <tr 
                    key={String(value)}
                    onMouseEnter={() => onValueHover(value)}
                    onMouseLeave={() => onValueHover(undefined)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{value === focusedValue ? '→' : ''}</td>
                    <td>{String(value)}</td>
                    <td>{count}</td>
                    <td>{points > 0 ? (points === count ? '✓' : points) : ''}</td>
                    <td>{linestrings > 0 ? (linestrings === count ? '✓' : linestrings) : ''}</td>
                    <td>{polygons > 0 ? (polygons === count ? '✓' : polygons) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default MVTLayerSelector;