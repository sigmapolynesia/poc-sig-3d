import { useState } from 'react';
import LidarMapGL from '../components/lidar/lidar-map-gl';
import LidarGiro3D from '../components/lidar/lidar-giro-3d';
import LidarCesiumJS from '../components/lidar/lidar-cesium-js';
import { Tabs, Title, Text } from '@mantine/core';

import MapLibreLogo from '../assets/maplibre.png';
import Giro3DLogo from '../assets/giro3d.png';
import CesiumLogo from '../assets/cesium.png';

const LidarView = () => {
  const [activeTab, setActiveTab] = useState('maplibre');

  return (
    <div className="lidar-container">
      <Title order={1} ta="left" mb={20}>LIDAR</Title>
      <Text ta="left" mb={20}>Visualisation d'images LIDAR dans les différentes solutions 3D Web choisies.</Text>
      
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
          <LidarMapGL />
        </Tabs.Panel>

        <Tabs.Panel value="giro3d">
          <LidarGiro3D />
        </Tabs.Panel>

        <Tabs.Panel value="cesium">
          <LidarCesiumJS />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default LidarView;