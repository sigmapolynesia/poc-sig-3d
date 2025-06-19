import { useState, useEffect } from 'react';
import proj4 from 'proj4';
import { Box, TextInput, Button, Group, Text, Card, Stack, Title, Grid, Switch } from '@mantine/core';

const Proj = () => {
  const [inputX, setInputX] = useState<string>('');
  const [inputY, setInputY] = useState<string>('');
  const [outputX, setOutputX] = useState<string>('');
  const [outputY, setOutputY] = useState<string>('');
  const [isWebMercatorToLonLat, setIsWebMercatorToLonLat] = useState<boolean>(true);
  
  useEffect(() => {
    proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs');
    proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
  }, []);

  const transformCoordinates = () => {
    if (!inputX || !inputY) return;

    try {
      let sourceProj, targetProj;
      const x = parseFloat(inputX);
      const y = parseFloat(inputY);
      
      if (isWebMercatorToLonLat) {
        sourceProj = 'EPSG:3857';
        targetProj = 'EPSG:4326';
      } else {
        sourceProj = 'EPSG:4326';
        targetProj = 'EPSG:3857';
      }
      
      const result = proj4(sourceProj, targetProj, [x, y]);
      
      if (isWebMercatorToLonLat) {
        setOutputX(result[0].toFixed(6));
        setOutputY(result[1].toFixed(6));
      } else {
        setOutputX(result[0].toFixed(2));
        setOutputY(result[1].toFixed(2));
      }
    } catch (error) {
      console.error('Erreur de transformation:', error);
      setOutputX('Erreur');
      setOutputY('Erreur');
    }
  };

  const swapValues = () => {
    setInputX(outputX);
    setInputY(outputY);
    setOutputX('');
    setOutputY('');
  };

  const resetFields = () => {
    setInputX('');
    setInputY('');
    setOutputX('');
    setOutputY('');
  };

  const inputLabel = isWebMercatorToLonLat ? 'Web Mercator (EPSG:3857)' : 'Longitude/Latitude (EPSG:4326)';
  const outputLabel = isWebMercatorToLonLat ? 'Longitude/Latitude (EPSG:4326)' : 'Web Mercator (EPSG:3857)';
  
  const inputXLabel = isWebMercatorToLonLat ? 'X:' : 'Longitude:';
  const inputYLabel = isWebMercatorToLonLat ? 'Y:' : 'Latitude:';
  const outputXLabel = isWebMercatorToLonLat ? 'Longitude:' : 'X:';
  const outputYLabel = isWebMercatorToLonLat ? 'Latitude:' : 'Y:';

  const examples = [
    {
      title: 'Tahiti (Lon/Lat)',
      coords: { x: '-140.16', y: '-8.86' },
      isWebMerc: false
    },
    {
      title: 'Bora Bora (Lon/Lat)',
      coords: { x: '-151.75', y: '-16.51' },
      isWebMerc: false
    },
    {
      title: 'Nuku Hiva (WebMercator)',
      coords: { x: '-15603527.039502', y: '-990646.573013' },
      isWebMerc: true
    },
    {
      title: 'Moorea (WebMercator)',
      coords: { x: '-16673731.42', y: '-1982009.69' },
      isWebMerc: true
    },
  ];

  const applyExample = (example: typeof examples[0]) => {
    setIsWebMercatorToLonLat(example.isWebMerc);
    setInputX(example.coords.x);
    setInputY(example.coords.y);
    setOutputX('');
    setOutputY('');
  };

  return (
    <Box p="md">
      <Title order={2} mb="lg">Convertisseur de Coordonnées</Title>
      
      <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
        <Stack>
          <Group justify="space-between">
            <Title order={4} mb="sm">Direction de conversion:</Title>
            <Switch
              checked={isWebMercatorToLonLat}
              onChange={(event) => setIsWebMercatorToLonLat(event.currentTarget.checked)}
              label={isWebMercatorToLonLat ? 'WebMercator → Lon/Lat' : 'Lon/Lat → WebMercator'}
              labelPosition="left"
            />
          </Group>
          
          <Grid>
            <Grid.Col span={6}>
              <Card shadow="xs" p="md" radius="md" withBorder>
                <Title order={4} mb="sm">{inputLabel}</Title>
                <TextInput
                  label={inputXLabel}
                  value={inputX}
                  onChange={(e) => setInputX(e.target.value)}
                  placeholder={isWebMercatorToLonLat ? "Ex: 260535.43" : "Ex: 2.3522"}
                  mb="sm"
                />
                <TextInput
                  label={inputYLabel}
                  value={inputY}
                  onChange={(e) => setInputY(e.target.value)}
                  placeholder={isWebMercatorToLonLat ? "Ex: 6250816.94" : "Ex: 48.8566"}
                  mb="sm"
                />
              </Card>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Card shadow="xs" p="md" radius="md" withBorder>
                <Title order={4} mb="sm">{outputLabel}</Title>
                <TextInput
                  label={outputXLabel}
                  value={outputX}
                  readOnly
                  mb="sm"
                />
                <TextInput
                  label={outputYLabel}
                  value={outputY}
                  readOnly
                  mb="sm"
                />
              </Card>
            </Grid.Col>
          </Grid>
          
          <Group justify="center" mt="md">
            <Button onClick={transformCoordinates} color="blue">
              Transformer
            </Button>
            <Button onClick={swapValues} color="green" disabled={!outputX || !outputY}>
              Utiliser le résultat
            </Button>
            <Button onClick={resetFields} color="red" variant="outline">
              Réinitialiser
            </Button>
          </Group>
        </Stack>
      </Card>
      
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={4} mb="md">Exemples:</Title>
        <Grid>
          {examples.map((example, index) => (
            <Grid.Col span={3} key={index}>
              <Card shadow="xs" p="sm" radius="md" withBorder>
                <Text size="sm" fw={500} mb="xs">{example.title}</Text>
                <Text size="xs">X/Lon: {example.coords.x}</Text>
                <Text size="xs">Y/Lat: {example.coords.y}</Text>
                <Button 
                  size="xs" 
                  fullWidth 
                  mt="sm" 
                  onClick={() => applyExample(example)}
                >
                  Appliquer
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Card>
      
      <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
        <Title order={4} mb="sm">Glossaire:</Title>
        <Text size="sm">
          <strong>Web Mercator (EPSG:3857)</strong>: Projection utilisée par la plupart des services de cartographie web comme Google Maps, OpenStreetMap, etc. Les coordonnées sont exprimées en mètres.
        </Text>
        <Text size="sm" mt="xs">
          <strong>WGS84 (EPSG:4326)</strong>: Système de coordonnées géographiques standard utilisé par le GPS. Les coordonnées sont exprimées en degrés décimaux (longitude et latitude).
        </Text>
      </Card>
    </Box>
  );
};

export default Proj;