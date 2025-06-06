import { useState } from 'react';
import ReliefMapGL from '../components/relief/relief-map-gl';
import ReliefGiro3D from '../components/relief/relief-giro-3d';
import ReliefCesiumJS from '../components/relief/relief-cesium-js';
import { Tabs, Title, Text } from '@mantine/core';

import MapLibreLogo from '../assets/maplibre.png';
import Giro3DLogo from '../assets/giro3d.png';
import CesiumLogo from '../assets/cesium.png';

const ReliefView = () => {
  const [activeTab, setActiveTab] = useState('maplibre');

  return (
    <div className="relief-container">
      <Title order={1} ta="left" mb={20}>Relief</Title>
      <Text ta="left" mb={20}>Visualisation de relief (MNT) dans les différentes solutions 3D Web choisies.</Text>
      
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
          <ReliefMapGL />
        </Tabs.Panel>

        <Tabs.Panel value="giro3d">
          <ReliefGiro3D />
        </Tabs.Panel>

        <Tabs.Panel value="cesium">
          <ReliefCesiumJS />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default ReliefView;