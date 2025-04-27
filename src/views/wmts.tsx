import { useState } from 'react';
import WMTSMapGL from '../components/wmts/wmts-map-gl';
import WMTSGiro3D from '../components/wmts/wmts-giro-3d';
import WMTSCesiumJS from '../components/wmts/wmts-cesium-js';
import { Tabs, Title, Text } from '@mantine/core';

// Importation des logos SVG
import MapLibreLogo from '../assets/maplibre.png';
import Giro3DLogo from '../assets/giro3d.png';
import CesiumLogo from '../assets/cesium.png';

const WMTSView = () => {
  const [activeTab, setActiveTab] = useState('maplibre');

  return (
    <div className="wmts-container">
      <Title order={1} ta="left" mb={20}>WMTS</Title>
      <Text ta="left" mb={20}>Visualisation du WMTS de TeFenua dans les différentes solutions 3D Web choisies.</Text>
      
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