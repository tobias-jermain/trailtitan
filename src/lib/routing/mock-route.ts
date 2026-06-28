import type { ExpeditionConfig, Waypoint } from '@/types/expedition'

/**
 * Offline demo data. When no ORS API key is set, the main process synthesises a
 * plausible mountain route so every downstream feature (map, elevation, export)
 * works without a network call. The shape scales with the number of waypoints
 * and follows a rolling elevation profile.
 */
export interface MockGeometry {
  geometry: [number, number][]
  elevations: number[]
}

/** Default anchor when the user hasn't placed any waypoints (Snowdonia). */
const DEFAULT_ANCHOR: [number, number] = [-4.0758, 53.0685]

export function buildMockGeometry(
  waypoints: Waypoint[],
  config: ExpeditionConfig,
): MockGeometry {
  const anchors =
    waypoints.length >= 2
      ? waypoints.map((w) => w.coordinates)
      : syntheticAnchors(waypoints[0]?.coordinates ?? DEFAULT_ANCHOR, config)

  const geometry: [number, number][] = []
  const elevations: number[] = []

  const samplesPerLeg = 24
  let cumProgress = 0
  const totalLegs = anchors.length - 1

  for (let leg = 0; leg < totalLegs; leg++) {
    const [aLng, aLat] = anchors[leg]
    const [bLng, bLat] = anchors[leg + 1]
    for (let s = 0; s < samplesPerLeg; s++) {
      const t = s / samplesPerLeg
      const lng = aLng + (bLng - aLng) * t
      const lat = aLat + (bLat - aLat) * t
      geometry.push([round(lng, 5), round(lat, 5)])
      const globalT = (leg + t) / totalLegs
      cumProgress = globalT
      elevations.push(mockElevation(globalT, config))
    }
  }
  // Close the final anchor.
  geometry.push([round(anchors[totalLegs][0], 5), round(anchors[totalLegs][1], 5)])
  elevations.push(mockElevation(1, config))

  void cumProgress
  return { geometry, elevations }
}

/** A rolling elevation profile with one major climb per day, in metres. */
function mockElevation(t: number, config: ExpeditionConfig): number {
  const base = 120
  const days = Math.max(1, config.daysCount)
  // Peak height scaled by the per-day ascent budget.
  const peak = Math.min(config.elevationBudgetPerDay * 0.55, 900)
  const dayPhase = (t * days) % 1
  const climb = Math.sin(dayPhase * Math.PI) * peak
  const ripple = Math.sin(t * Math.PI * 12) * 25
  return Math.round(base + climb + ripple)
}

/** Generate a loop of anchor points around a centre, sized by the config. */
function syntheticAnchors(
  centre: [number, number],
  config: ExpeditionConfig,
): [number, number][] {
  const [lng, lat] = centre
  const days = Math.max(1, config.daysCount)
  // Roughly target the upper daily distance limit across all days.
  const targetKm = config.dailyDistanceLimits.max * days
  // ~111 km per degree of latitude; pick a radius that yields ~targetKm.
  const radiusDeg = Math.min(0.25, (targetKm / 111) * 0.18)
  const points: [number, number][] = []
  const legs = Math.max(4, days * 2)
  for (let i = 0; i <= legs; i++) {
    const angle = (i / legs) * Math.PI * 2
    points.push([
      round(lng + Math.cos(angle) * radiusDeg, 5),
      round(lat + Math.sin(angle) * radiusDeg * 0.7, 5),
    ])
  }
  return points
}

function round(n: number, dp: number): number {
  const f = 10 ** dp
  return Math.round(n * f) / f
}
