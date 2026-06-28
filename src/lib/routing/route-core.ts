import type {
  ExpeditionConfig,
  ElevationPoint,
  GeneratedRoute,
  RouteStage,
} from '@/types/expedition'
import { naismithTime } from './naismith'
import { ascentDescent, haversineKm, polylineLengthKm } from './elevation'

/**
 * Pure route-building logic shared by the Electron main process (which calls
 * ORS or returns the mock) and the test suite. Takes raw geometry + a parallel
 * elevation array and produces a fully-normalised GeneratedRoute, split into
 * one stage per hiking day.
 *
 * It contains no Electron, DOM, or network code so it can be imported safely
 * from either process.
 */
export interface RawRouteInput {
  name: string
  /** [lng, lat] pairs. */
  geometry: [number, number][]
  /** Elevation (m) parallel to `geometry`; falls back to a flat profile. */
  elevations?: number[]
  config: ExpeditionConfig
  isMock: boolean
}

/** Build a cumulative-distance elevation profile from geometry + elevations. */
export function buildElevationProfile(
  geometry: [number, number][],
  elevations: number[] | undefined,
): ElevationPoint[] {
  const profile: ElevationPoint[] = []
  let cumKm = 0
  for (let i = 0; i < geometry.length; i++) {
    if (i > 0) cumKm += haversineKm(geometry[i - 1], geometry[i])
    profile.push({
      distanceKm: round(cumKm, 3),
      elevationM: Math.round(elevations?.[i] ?? 0),
    })
  }
  return profile
}

/**
 * Split a route into `daysCount` stages of roughly equal distance. The geometry
 * is partitioned by cumulative distance so each stage carries its own polyline,
 * stats, and Naismith time estimate.
 */
export function buildStages(
  geometry: [number, number][],
  profile: ElevationPoint[],
  config: ExpeditionConfig,
): RouteStage[] {
  const totalKm = polylineLengthKm(geometry)
  const days = Math.max(1, config.daysCount)
  const perDayKm = totalKm / days
  const stages: RouteStage[] = []

  let stageStartIdx = 0
  for (let day = 1; day <= days; day++) {
    const targetKm = day === days ? totalKm : perDayKm * day
    let endIdx = stageStartIdx
    while (
      endIdx < profile.length - 1 &&
      profile[endIdx].distanceKm < targetKm
    ) {
      endIdx++
    }
    const segGeometry = geometry.slice(stageStartIdx, endIdx + 1)
    const segProfile = profile.slice(stageStartIdx, endIdx + 1)
    const { ascentM, descentM } = ascentDescent(segProfile)
    const distanceKm = round(polylineLengthKm(segGeometry), 2)
    stages.push({
      day,
      from: day === 1 ? 'Start' : `Day ${day} start`,
      to: day === days ? 'Finish' : `Day ${day} camp`,
      distanceKm,
      ascentM,
      descentM,
      estTimeMins: naismithTime(distanceKm, ascentM, config.pace),
      coordinates: segGeometry,
    })
    stageStartIdx = endIdx
  }
  return stages
}

export function buildRoute(input: RawRouteInput): GeneratedRoute {
  const { geometry, elevations, config, name, isMock } = input
  const profile = buildElevationProfile(geometry, elevations)
  const stages = buildStages(geometry, profile, config)
  const { ascentM, descentM } = ascentDescent(profile)

  return {
    id: cryptoId(),
    name,
    createdAt: new Date().toISOString(),
    geometry,
    totalDistanceKm: round(polylineLengthKm(geometry), 2),
    totalAscentM: ascentM,
    totalDescentM: descentM,
    totalTimeMins: stages.reduce((sum, s) => sum + s.estTimeMins, 0),
    stages,
    elevationProfile: profile,
    isMock,
    config,
  }
}

function round(n: number, dp: number): number {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

function cryptoId(): string {
  // Works in both Node 18+ and the browser.
  try {
    return globalThis.crypto.randomUUID()
  } catch {
    return `route-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
}
