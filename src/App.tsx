import { useState } from 'react';
import { MantineProvider, AppShell, NavLink, Group, Text, Image, Badge, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import './App.css';
import Globe from './components/Globe';
import WMTSView from './views/wmts';
import logoSigma from './assets/logosigma.png';

function App() { 

  const [currentView, setCurrentView] = useState<'globe' | 'wmts'>('wmts');
  const handleWMTSClick = () => setCurrentView('wmts');
  const handleGlobeClick = () => setCurrentView('globe');

  const [opened] = useDisclosure();

  return (
    <MantineProvider>
      
      <AppShell
      header={{ height: 65 }}
      navbar= {{ width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
       }}
      padding= "md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Image src={logoSigma} height={40} alt="Logo Sigma" />
            <Text c="dark" fw={700}>POC 3d</Text>
            <Badge variant="light" color="green">Bêta</Badge>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Title ta="left" mb={10} order={2}>Menu</Title>
          <NavLink
            label="WMTS"
            active={currentView === 'wmts'}
            onClick={handleWMTSClick}
          />
          <NavLink
            label="Globe"
            active={currentView === 'globe'}
            onClick={handleGlobeClick}
          />
        </AppShell.Navbar>
        <AppShell.Main>
          {currentView === 'wmts' ? (
            <WMTSView />
          ) : (
            <Globe 
              height="1000px"
            />
          )}
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;