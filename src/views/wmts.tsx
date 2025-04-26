import { useState } from 'react';
import WMTSMapGL from '../components/wmts/wmts-map-gl';
import WMTSGiro3D from '../components/wmts/wmts-giro-3d';
import WMTSCesiumJS from '../components/wmts/wmts-cesium-js';
import { Tabs, Title, Text } from '@mantine/core';

const WMTSView = () => {
  const [activeTab, setActiveTab] = useState('maplibre');

  return (
    <div className="wmts-container">
      <Title order={1} ta="left" mb={20}>WMTS</Title>
      <Text ta="left" mb={20}>Visualisation du WMTS de TeFenua dans les différentes solution 3D Web choisis.</Text>
      
      <Tabs keepMounted={false} value={activeTab} onChange={(value) => setActiveTab(value || 'maplibre')}>
        <Tabs.List>
          <Tabs.Tab value="maplibre">MapLibre</Tabs.Tab>
          <Tabs.Tab value="giro3d">Giro 3D</Tabs.Tab>
          <Tabs.Tab value="cesium">Cesium</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="maplibre">
          <WMTSMapGL />
        </Tabs.Panel>

        <Tabs.Panel value="giro3d">
          <WMTSGiro3D />
        </Tabs.Panel>

        <Tabs.Panel value="cesium">
          <WMTSCesiumJS />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default WMTSView;