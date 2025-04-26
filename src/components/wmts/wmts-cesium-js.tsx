import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { InputBase, Combobox, useCombobox, CheckIcon, Group, ActionIcon } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

const WMTSCesiumJS = () => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>("TEFENUA:FOND");
  
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === 'keyboard') {
        combobox.selectActiveOption();
      } else {
        combobox.updateSelectedOptionIndex('active');
      }
    },
  });
  
  const layers = [
    { identifier: "TEFENUA:FOND", title: "FOND Tefenua" },
    { identifier: "TEFENUA:FOND_LEGER_v1", title: "Fond Léger" },
  ];

  const getLayerTitleById = (id: string) => {
    const layer = layers.find((l) => l.identifier === id);
    return layer ? layer.title : id;
  };

  const reloadCurrentLayer = () => {
    if (viewer) {
      viewer.imageryLayers.removeAll();
      loadWMTSLayer(selectedLayer);
    }
  };

  const loadWMTSLayer = (layerId: string) => {
    if (!viewer) return;
    
    const wmtsProvider = new Cesium.WebMapTileServiceImageryProvider({
      url: "https://green.tefenua.gov.pf:443/api/wmts",
      layer: layerId,
      style: "default",
      format: layerId === "TEFENUA:FOND" ? "image/jpeg" : "image/png8",
      tileMatrixSetID: "EPSG:4326",
      tileMatrixLabels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
      maximumLevel: 19,
      credit: new Cesium.Credit("© Tefenua - Gouvernement de la Polynésie française")
    });

    viewer.imageryLayers.addImageryProvider(wmtsProvider);
  };

  useEffect(() => {
    if (!cesiumContainer.current) return;
    
    const viewer = new Cesium.Viewer(cesiumContainer.current, {
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: true,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      terrainProvider: new Cesium.EllipsoidTerrainProvider()
    });

    viewer.imageryLayers.removeAll();

    setViewer(viewer);

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-119, -33.2, 500000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0
      }
    });

    return () => {
      viewer.destroy();
    };
  }, []);

  useEffect(() => {
    if (!viewer) return;

    viewer.imageryLayers.removeAll();
    loadWMTSLayer(selectedLayer);
  }, [viewer, selectedLayer]);

  return (
    <div style={{ width: '100%', height: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px' }}>
        <Group>
          <Combobox
            store={combobox}
            resetSelectionOnOptionHover
            onOptionSubmit={(val) => {
              const selectedLayerObj = layers.find(l => l.title === val);
              if (selectedLayerObj) {
                setSelectedLayer(selectedLayerObj.identifier);
              }
              combobox.updateSelectedOptionIndex('active');
              combobox.closeDropdown();
            }}
          >
            <Combobox.Target targetType="button">
              <InputBase
                mt={20}
                mb={10}
                maw={200}
                component="button"
                type="button"
                pointer
                rightSection={<Combobox.Chevron />}
                rightSectionPointerEvents="none"
                onClick={() => combobox.toggleDropdown()}
                style={{ minWidth: '250px' }}
              >
                {getLayerTitleById(selectedLayer)}
              </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options>
                <Combobox.Group label="Te Fenua">
                  {layers.map((layer) => (
                    <Combobox.Option 
                      value={layer.title} 
                      key={layer.identifier}
                      active={layer.identifier === selectedLayer}
                    >
                      <Group gap="xs">
                        {layer.identifier === selectedLayer && <CheckIcon size={12} />}
                        <span>{layer.title}</span>
                      </Group>
                    </Combobox.Option>
                  ))}
                </Combobox.Group>
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
          <ActionIcon mt={10} variant="subtle" color="rgba(0, 0, 0, 1)" onClick={reloadCurrentLayer}>
            <IconRefresh style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
        </Group>
      </div>
      <div ref={cesiumContainer} style={{ width: '100%', height: '950px', borderRadius: '4px' }} />
    </div>
  );
};

export default WMTSCesiumJS;