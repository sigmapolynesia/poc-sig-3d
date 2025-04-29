import React from 'react';
import { Combobox, InputBase, Group, ActionIcon, CheckIcon, useCombobox } from '@mantine/core';
import { WMTSLayer } from '../../types/wmts';
import { faRefresh } from '@fortawesome/free-solid-svg-icons/faRefresh'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



interface WMTSLayerSelectorProps {
  layers: WMTSLayer[];
  currentLayer: string;
  onLayerChange: (layerId: string) => void;
  onRefresh: () => void;
  title?: string;
  loading?: boolean;
}

const WMTSLayerSelector: React.FC<WMTSLayerSelectorProps> = ({
  layers,
  currentLayer,
  onLayerChange,
  onRefresh,
  title = "Te Fenua",
  loading = false
}) => {
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

  const getLayerTitleById = (id: string): string => {
    const layer = layers.find(l => l.identifier === id);
    return layer ? layer.title : id;
  };

  return (
    <Group>
      <Combobox
        store={combobox}
        resetSelectionOnOptionHover
        onOptionSubmit={(val) => {
          const selectedLayer = layers.find(l => l.title === val);
          if (selectedLayer) {
            onLayerChange(selectedLayer.identifier);
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
            disabled={loading || layers.length === 0}
          >
            {loading ? 'Chargement...' : getLayerTitleById(currentLayer)}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            <Combobox.Group label={title}>
              {layers.map((layer) => (
                <Combobox.Option 
                  value={layer.title} 
                  key={layer.identifier}
                  active={layer.identifier === currentLayer}
                >
                  <Group gap="xs">
                    {layer.identifier === currentLayer && <CheckIcon size={12} />}
                    <span>{layer.title}</span>
                  </Group>
                </Combobox.Option>
              ))}
            </Combobox.Group>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <ActionIcon 
        mt={10} 
        variant="subtle" 
        color="rgba(0, 0, 0, 1)" 
        onClick={onRefresh}
        disabled={loading}
        title="Refresh layers"
        aria-label="Refresh layers"
      >
        <FontAwesomeIcon icon={faRefresh} />
      </ActionIcon>
    </Group>
  );
};

export default WMTSLayerSelector;