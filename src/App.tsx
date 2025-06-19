import { useState } from 'react';
import { MantineProvider, AppShell, NavLink, Group, Text, Image, Badge, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import './App.css';
import Globe from './components/Globe';
import MultiLayer from './components/MultiLayer';
import WMTSView from './views/wmts';
import ReliefView from './views/relief';
import GeojsonView from './views/geojson';
import MVTView from './views/mvt';
import LidarView from './views/lidar';
import DtilesView from './views/3d-tiles';
import ModelsView from './views/3d-models';
import logoSigma from './assets/logosigma.png';
import React from 'react';

type ViewType = 'multi-layer' | 'globe' | 'wmts' | 'relief' | 'geojson' | 'mvt' | 'lidar' | '3d-tiles' | '3d-models';

interface NavItem {
  id: ViewType;
  label: string;
  component: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
}

function App() {
  const navItems: NavItem[] = [
    { id: 'wmts', label: 'WMTS', component: WMTSView },
    { id: 'relief', label: 'Relief', component: ReliefView },
    { id: 'geojson', label: 'GeoJSON', component: GeojsonView },
    { id: 'mvt', label: 'MVT', component: MVTView },
    { id: 'lidar', label: 'LIDAR', component: LidarView },
    { id: '3d-tiles', label: '3D Tiles', component: DtilesView },
    { id: '3d-models', label: '3D Models', component: ModelsView },
    { id: 'globe', label: 'Globe', component: Globe, props: { height: '1000px' } },
    { id: 'multi-layer', label: 'Multi Layer', component: MultiLayer }
  ];

  const [currentView, setCurrentView] = useState<ViewType>('multi-layer');
  const [opened] = useDisclosure();

  const currentNavItem = navItems.find(item => item.id === currentView) || navItems[0];

  return (
    <MantineProvider>
      <AppShell
        header={{ height: 65 }}
        navbar={{
          width: 250,
          breakpoint: 'sm',
          collapsed: { mobile: !opened }
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Image src={logoSigma} height={40} alt="Logo Sigma" />
            <Text c="dark" fw={700}>POC 3D</Text>
            <Badge variant="light" color="green">Bêta</Badge>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Title ta="left" mb={10} order={2}>Menu</Title>
          
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              label={item.label}
              active={currentView === item.id}
              onClick={() => setCurrentView(item.id)}
            />
          ))}
        </AppShell.Navbar>
        
        <AppShell.Main>
          {React.createElement(
            currentNavItem.component,
            currentNavItem.props
          )}
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;