import type { Pace } from '@/types/expedition'

/**
 * Naismith's rule with a pace multiplier.
 *
 * Base: 5 km/h on the flat at moderate pace, plus 1 minute per 10 m of ascent.
 * The pace multiplier scales the walking (distance) component only; the climb
 * component is treated as a fixed physiological cost.
 */
export const PACE_MULTIPLIERS: Record<Pace, number> = {
  slow: 1.5,
  moderate: 1.0,
  fast: 0.75,
}

export const BASE_SPEED_KPH = 5
/** Minutes of extra time per metre of ascent (1 min / 10 m). */
export const ASCENT_MIN_PER_M = 1 / 10

/** Estimated walking time in whole minutes. */
export function naismithTime(
  distanceKm: number,
  ascentM: number,
  pace: Pace,
): number {
  const multiplier = PACE_MULTIPLIERS[pace]
  const walkMinutes = (distanceKm / BASE_SPEED_KPH) * 60 * multiplier
  const climbMinutes = Math.max(0, ascentM) * ASCENT_MIN_PER_M
  return Math.round(walkMinutes + climbMinutes)
}

/** Effective flat-ground speed for a pace, in km/h (for display). */
export function effectiveSpeedKph(pace: Pace): number {
  return BASE_SPEED_KPH / PACE_MULTIPLIERS[pace]
}

/** Format a minute count as "Hh MMm" (or "MMm" under an hour). */
export function formatDuration(mins: number): string {
  const safe = Math.max(0, Math.round(mins))
  const h = Math.floor(safe / 60)
  const m = safe % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m.toString().padStart(2, '0')}m`
}
