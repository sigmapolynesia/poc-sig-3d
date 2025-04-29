import { useState } from 'react';
import GeojsonMapGL from '../components/geojson/geojson-map-gl';
import GeojsonGiro3D from '../components/geojson/geojson-giro-3d';
import GeojsonCesiumJS from '../components/geojson/geojson-cesium-js';
import { Tabs, Title, Text } from '@mantine/core';

import MapLibreLogo from '../assets/maplibre.png';
import Giro3DLogo from '../assets/giro3d.png';
import CesiumLogo from '../assets/cesium.png';

const GeojsonView = () => {
  const [activeTab, setActiveTab] = useState('maplibre');

  return (
    <div className="geojson-container">
      <Title order={1} ta="left" mb={20}>GeoJSON</Title>
      <Text ta="left" mb={20}>Visualisation de données GeoJSON dans les différentes solutions 3D Web choisies.</Text>
      
      <Tabs keepMounted={false} value={activeTab} onChange={(value) => setActiveTab(value || 'maplibre')}>
        <Tabs.List>
          <Tabs.Tab value="maplibre">
            <img src={MapLibreLogo} alt="MapLibre" style={{ height: '20px' }} />
          </Tabs.Tab>
          <Tabs.Tab value="giro3d">
            <img src={Giro3DLogo} alt="Giro 3D" style={{ height: '16px' }} />
          </Tabs.Tab>
          <Tabs.Tab value="cesium">
            <img src={CesiumLogo} alt="Cesium" style={{ height: '20px' }} />
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="maplibre">
          <GeojsonMapGL />
        </Tabs.Panel>

        <Tabs.Panel value="giro3d">
          <GeojsonGiro3D />
        </Tabs.Panel>

        <Tabs.Panel value="cesium">
          <GeojsonCesiumJS />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default GeojsonView;