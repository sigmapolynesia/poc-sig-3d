import { useState } from 'react';
import GLTFMapGL from '../components/3d-models/gltf-map-gl';
import GLTFGiro3D from '../components/3d-models/gltf-giro-3d';
import GLBMapGL from '../components/3d-models/glb-map-gl';
import GLBGiro3D from '../components/3d-models/glb-giro-3d';
import GLBRMapGL from '../components/3d-models/glb-relief-map-gl';
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
          <Tabs.Tab value="maplibreglb">
            <img src={MapLibreLogo} alt="MapLibre GLB" style={{ height: '20px' }} />
          </Tabs.Tab>
          <Tabs.Tab value="giro3dglb">
            <img src={Giro3DLogo} alt="Giro 3D GLB" style={{ height: '16px' }} />
          </Tabs.Tab>
          <Tabs.Tab value="maplibre-relief">
            <img src={MapLibreLogo} alt="MapLibre Relief" style={{ height: '20px' }} />
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="maplibre">
          <GLTFMapGL />
        </Tabs.Panel>

        <Tabs.Panel value="giro3d">
          <GLTFGiro3D />
        </Tabs.Panel>

        <Tabs.Panel value="maplibreglb">
          <GLBMapGL />
        </Tabs.Panel>

        <Tabs.Panel value="giro3dglb">
          <GLBGiro3D />
        </Tabs.Panel>

        <Tabs.Panel value="maplibre-relief">
          <GLBRMapGL />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default ModelsView;