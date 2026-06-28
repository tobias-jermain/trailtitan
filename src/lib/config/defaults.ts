import type { ExpeditionConfig } from './schema'

/**
 * Baseline ExpeditionConfig. Presets are `Partial<ExpeditionConfig>` objects
 * merged over this. Values mirror the documented defaults in docs/config.md.
 */
export const defaultConfig: ExpeditionConfig = {
  expeditionMode: 'day',
  daysCount: 1,
  groupSize: { min: 1, max: 6 },
  pace: 'moderate',
  dailyDistanceLimits: { min: 0, max: 40 },
  elevationBudgetPerDay: 1500,
  terrainPreference: 'moderate',
  surfaceWeights: {
    footpath: 0.8,
    bridleway: 0.6,
    track: 0.4,
    road: 0.1,
  },
  checkpoints: [],
  campingAllowed: false,
  wildcampingAllowed: false,
  resupplyPoints: [],
  weatherThresholds: {
    enabled: false,
    maxWindSpeedKph: 50,
    maxRainfallMmPerHr: 10,
    minVisibilityKm: 2,
  },
  reportExport: 'gpx',
  emergencyContacts: [],
}
