import { useState } from 'react';
import DtilesMapGL from '../components/3d-tiles/3d-tiles-map-gl';
import DtilesGiro3D from '../components/3d-tiles/3d-tiles-giro-3d';
import DtilesCesiumJS from '../components/3d-tiles/3d-tiles-cesium-js';
import { Tabs, Title, Text } from '@mantine/core';

// Importation des logos SVG
import MapLibreLogo from '../assets/maplibre.png';
import Giro3DLogo from '../assets/giro3d.png';
import CesiumLogo from '../assets/cesium.png';

const DtilesView = () => {
  const [activeTab, setActiveTab] = useState('maplibre');

  return (
    <div className="3d-tiles-container">
      <Title order={1} ta="left" mb={20}>3d-tiles</Title>
      <Text ta="left" mb={20}>Visualisation du 3d-tiles de TeFenua dans les différentes solutions 3D Web choisies.</Text>
      
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
          <DtilesMapGL />
        </Tabs.Panel>

        <Tabs.Panel value="giro3d">
          <DtilesGiro3D />
        </Tabs.Panel>

        <Tabs.Panel value="cesium">
          <DtilesCesiumJS />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default DtilesView;