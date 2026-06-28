import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

/**
 * Leaflet's default icon URLs break under a bundler. Re-point them at the
 * Vite-resolved asset URLs once, at module load.
 */
let patched = false
export function ensureLeafletIcons(): void {
  if (patched) return
  patched = true
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
    ._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  })
}

/** A coloured circular marker for checkpoints / resupply points. */
export function dotIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'trailtitan-dot',
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,.3)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}
