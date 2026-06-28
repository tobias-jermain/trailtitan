import { useEffect } from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import type { GeneratedRoute, Waypoint } from '@/types/expedition'
import { ensureLeafletIcons, dotIcon } from './leaflet-icons'
import { WaypointMarker } from './WaypointMarker'
import { RoutePolyline } from './RoutePolyline'

ensureLeafletIcons()

interface RouteMapProps {
  waypoints: Waypoint[]
  route: GeneratedRoute | null
  onAddWaypoint?: (coordinates: [number, number]) => void
  onMoveWaypoint?: (id: string, coordinates: [number, number]) => void
  onRemoveWaypoint?: (id: string) => void
  /** Disable map clicks (read-only views). */
  interactive?: boolean
  className?: string
}

const DEFAULT_CENTER: [number, number] = [53.0685, -4.0758] // Snowdonia
const DEFAULT_ZOOM = 11

/** Captures map clicks to add waypoints. */
function ClickToAdd({
  onAdd,
}: {
  onAdd?: (coordinates: [number, number]) => void
}) {
  useMapEvents({
    click(e) {
      onAdd?.([e.latlng.lng, e.latlng.lat])
    },
  })
  return null
}

/** Fits the map to the current route geometry whenever it changes. */
function FitToRoute({ route }: { route: GeneratedRoute | null }) {
  const map = useMap()
  useEffect(() => {
    if (!route || route.geometry.length === 0) return
    const bounds: LatLngBoundsExpression = route.geometry.map(([lng, lat]) => [
      lat,
      lng,
    ])
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [route, map])
  return null
}

export function RouteMap({
  waypoints,
  route,
  onAddWaypoint,
  onMoveWaypoint,
  onRemoveWaypoint,
  interactive = true,
  className,
}: RouteMapProps) {
  return (
    <div className={className ?? 'h-full w-full'}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {interactive && <ClickToAdd onAdd={onAddWaypoint} />}
        <FitToRoute route={route} />

        {route && <RoutePolyline stages={route.stages} />}

        {interactive &&
          onMoveWaypoint &&
          onRemoveWaypoint &&
          waypoints.map((wp) => (
            <WaypointMarker
              key={wp.id}
              waypoint={wp}
              onMove={onMoveWaypoint}
              onRemove={onRemoveWaypoint}
            />
          ))}

        {/* Checkpoints from the active route's config. */}
        {route?.config.checkpoints.map((cp) => (
          <Marker
            key={cp.id}
            position={[cp.coordinates[1], cp.coordinates[0]]}
            icon={dotIcon('#1e7d6b')}
          />
        ))}
      </MapContainer>
    </div>
  )
}
