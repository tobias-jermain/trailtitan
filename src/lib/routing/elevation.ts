import type { ElevationPoint } from '@/types/expedition'

const EARTH_RADIUS_KM = 6371

/** Great-circle distance between two [lng, lat] points, in km (haversine). */
export function haversineKm(a: [number, number], b: [number, number]): number {
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const lat1r = toRad(lat1)
  const lat2r = toRad(lat2)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1r) * Math.cos(lat2r) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Total length of a polyline of [lng, lat] points, in km. */
export function polylineLengthKm(coords: [number, number][]): number {
  let total = 0
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1], coords[i])
  }
  return total
}

export interface AscentDescent {
  ascentM: number
  descentM: number
}

/**
 * Sum positive and negative elevation changes across a profile.
 * A small threshold filters out noise from densely-sampled elevation data.
 */
export function ascentDescent(
  profile: ElevationPoint[],
  noiseThresholdM = 1,
): AscentDescent {
  let ascentM = 0
  let descentM = 0
  for (let i = 1; i < profile.length; i++) {
    const delta = profile[i].elevationM - profile[i - 1].elevationM
    if (delta > noiseThresholdM) ascentM += delta
    else if (delta < -noiseThresholdM) descentM += -delta
  }
  return { ascentM: Math.round(ascentM), descentM: Math.round(descentM) }
}
