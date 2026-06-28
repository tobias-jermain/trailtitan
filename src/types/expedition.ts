import type { ExpeditionConfig } from '@/lib/config/schema'

export type {
  ExpeditionConfig,
  SurfaceWeights,
  Checkpoint,
  ResupplyPoint,
  WeatherThresholds,
  EmergencyContact,
  Pace,
  ExpeditionMode,
  TerrainPreference,
} from '@/lib/config/schema'

/** A user-placed point on the map. [lng, lat] in GeoJSON order. */
export interface Waypoint {
  id: string
  /** [lng, lat] */
  coordinates: [number, number]
  label?: string
}

/** One day's worth of route within a multi-day expedition. */
export interface RouteStage {
  day: number
  from: string
  to: string
  distanceKm: number
  ascentM: number
  descentM: number
  estTimeMins: number
  /** [lng, lat] coordinate pairs for this stage's polyline. */
  coordinates: [number, number][]
}

/** A point on the elevation profile. */
export interface ElevationPoint {
  /** Cumulative distance from the route start, in km. */
  distanceKm: number
  /** Elevation in metres. */
  elevationM: number
}

/** The result of a routing call, normalised from ORS or the mock. */
export interface GeneratedRoute {
  id: string
  name: string
  createdAt: string
  /** Full route geometry as [lng, lat] pairs. */
  geometry: [number, number][]
  totalDistanceKm: number
  totalAscentM: number
  totalDescentM: number
  totalTimeMins: number
  stages: RouteStage[]
  elevationProfile: ElevationPoint[]
  /** True when produced by the offline mock (no API key set). */
  isMock: boolean
  /** Snapshot of the config used to generate this route. */
  config: ExpeditionConfig
}

export type RoutingResult =
  | { ok: true; route: GeneratedRoute }
  | { ok: false; error: string }

export type ExportFormat = 'gpx' | 'pdf' | 'csv'

export interface ExportResult {
  path: string
}
