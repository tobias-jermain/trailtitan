import { Polyline } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import type { RouteStage } from '@/types/expedition'

/** Per-day stage colours, cycled across a multi-day route. */
const STAGE_COLORS = ['#16306b', '#1e7d6b', '#1c4a8f', '#2a8f6a', '#3b5bdb']

interface RoutePolylineProps {
  stages: RouteStage[]
}

/** Renders one coloured polyline per stage/day. */
export function RoutePolyline({ stages }: RoutePolylineProps) {
  return (
    <>
      {stages.map((stage) => {
        const positions: LatLngExpression[] = stage.coordinates.map(
          ([lng, lat]) => [lat, lng],
        )
        return (
          <Polyline
            key={stage.day}
            positions={positions}
            pathOptions={{
              color: STAGE_COLORS[(stage.day - 1) % STAGE_COLORS.length],
              weight: 5,
              opacity: 0.85,
            }}
          />
        )
      })}
    </>
  )
}
