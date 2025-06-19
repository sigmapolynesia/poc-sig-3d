import { useState } from 'react';
import MVTMapGL from '../components/mvt/mvt-map-gl';
import MVTGiro3D from '../components/mvt/mvt-giro-3d';
import MVTCesiumJS from '../components/mvt/mvt-cesium-js';
import { Tabs, Title, Text } from '@mantine/core';

import MapLibreLogo from '../assets/maplibre.png';
import Giro3DLogo from '../assets/giro3d.png';
import CesiumLogo from '../assets/cesium.png';

const MVTView = () => {
  const [activeTab, setActiveTab] = useState('maplibre');

  return (
    <div className="mvt-container">
      <Title order={1} ta="left" mb={20}>MVT</Title>
      <Text ta="left" mb={20}>Visualisation de MVT dans les différentes solutions 3D Web choisies.</Text>
      
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
          <MVTMapGL />
        </Tabs.Panel>

        <Tabs.Panel value="giro3d">
          <MVTGiro3D />
        </Tabs.Panel>

        <Tabs.Panel value="cesium">
          <MVTCesiumJS />
        </Tabs.Panel>

      </Tabs>
    </div>
  );
};

export default MVTView;