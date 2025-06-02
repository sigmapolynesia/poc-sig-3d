import { useState } from 'react';
import Model3DMapGL from '../components/3d-models/3d-models-map-gl';
import Model3DGiro3D from '../components/3d-models/3d-models-giro-3d';
import { Tabs, Title, Text } from '@mantine/core';

import MapLibreLogo from '../assets/maplibre.png';
import Giro3DLogo from '../assets/giro3d.png';

const ModelsView = () => {
  const [activeTab, setActiveTab] = useState('maplibre');

  return (
    <div className="3d-tiles-container">
      <Title order={1} ta="left" mb={20}>3D Models</Title>
      <Text ta="left" mb={20}>Visualisation de modèles 3D dans les différentes solutions 3D Web choisies.</Text>
      
      <Tabs keepMounted={false} value={activeTab} onChange={(value) => setActiveTab(value || 'maplibre')}>
        <Tabs.List>
          <Tabs.Tab value="maplibre">
            <img src={MapLibreLogo} alt="MapLibre" style={{ height: '20px' }} />
          </Tabs.Tab>
          <Tabs.Tab value="giro3d">
            <img src={Giro3DLogo} alt="Giro 3D" style={{ height: '16px' }} />
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="maplibre">
          <Model3DMapGL />
        </Tabs.Panel>

        <Tabs.Panel value="giro3d">
          <Model3DGiro3D />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default ModelsView;