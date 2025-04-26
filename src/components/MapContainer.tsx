import { FC, PropsWithChildren, RefObject } from 'react'
import { Box, BoxProps } from '@mantine/core'

export type MapContainerProps = BoxProps & PropsWithChildren<{
  ref: RefObject<HTMLDivElement | null>
}>

const MapContainer: FC<MapContainerProps> = (props) => {
  return (
    <Box
      bg="gray.1"
      w="100%"
      h="60dvh"
      flex={1}
      {...props}
    />
  )
}

export default MapContainer
