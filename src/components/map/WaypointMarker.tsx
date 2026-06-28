import { useMemo, useRef } from 'react'
import { Marker, Popup } from 'react-leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import type { Waypoint } from '@/types/expedition'

interface WaypointMarkerProps {
  waypoint: Waypoint
  onMove: (id: string, coordinates: [number, number]) => void
  onRemove: (id: string) => void
}

/** A draggable waypoint marker. Reports its new [lng, lat] after a drag. */
export function WaypointMarker({ waypoint, onMove, onRemove }: WaypointMarkerProps) {
  const ref = useRef<LeafletMarker | null>(null)
  const [lng, lat] = waypoint.coordinates

  const handlers = useMemo(
    () => ({
      dragend() {
        const marker = ref.current
        if (!marker) return
        const { lat: newLat, lng: newLng } = marker.getLatLng()
        onMove(waypoint.id, [newLng, newLat])
      },
    }),
    [onMove, waypoint.id],
  )

  return (
    <Marker
      ref={ref}
      draggable
      eventHandlers={handlers}
      position={[lat, lng]}
    >
      <Popup>
        <div className="space-y-2 text-sm">
          <p className="font-medium">{waypoint.label ?? 'Waypoint'}</p>
          <p className="text-xs text-muted-foreground">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
          <button
            className="text-xs font-medium text-red-600 hover:underline"
            onClick={() => onRemove(waypoint.id)}
          >
            Remove waypoint
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
