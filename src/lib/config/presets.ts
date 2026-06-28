import type { ExpeditionConfig } from './schema'
import { defaultConfig } from './defaults'

export interface PresetBundle {
  id: string
  name: string
  description: string
  config: Partial<ExpeditionConfig>
}

/**
 * Built-in preset bundles. Each is a `Partial<ExpeditionConfig>` merged over
 * `defaultConfig`. Users can create their own, persisted in AppConfig.userPresets.
 * Names are deliberately generic — no programme or award scheme is referenced.
 */
export const builtInPresets: PresetBundle[] = [
  {
    id: 'day-walk',
    name: 'Day Walk',
    description: 'A single-day walk for one to six people on moderate terrain.',
    config: {
      expeditionMode: 'day',
      daysCount: 1,
      groupSize: { min: 1, max: 6 },
      pace: 'moderate',
      dailyDistanceLimits: { min: 5, max: 25 },
      terrainPreference: 'moderate',
    },
  },
  {
    id: 'weekend-trek',
    name: 'Weekend Trek',
    description: 'Two consecutive days with overnight camping.',
    config: {
      expeditionMode: 'multi-day',
      daysCount: 2,
      groupSize: { min: 1, max: 6 },
      campingAllowed: true,
      dailyDistanceLimits: { min: 10, max: 30 },
      pace: 'moderate',
    },
  },
  {
    id: 'long-distance-trek',
    name: 'Long Distance Trek',
    description: 'Five days of point-to-point hiking with no terrain filtering.',
    config: {
      expeditionMode: 'multi-day',
      daysCount: 5,
      groupSize: { min: 1, max: 6 },
      campingAllowed: true,
      dailyDistanceLimits: { min: 15, max: 35 },
      terrainPreference: 'any',
    },
  },
  {
    id: 'alpine-day',
    name: 'Alpine Day',
    description: 'A demanding single-day route with a high ascent budget.',
    config: {
      expeditionMode: 'day',
      daysCount: 1,
      groupSize: { min: 1, max: 4 },
      pace: 'slow',
      terrainPreference: 'challenging',
      elevationBudgetPerDay: 2500,
    },
  },
  {
    id: 'group-expedition',
    name: 'Group Expedition',
    description: 'A four-day expedition for a larger group, with all exports enabled.',
    config: {
      expeditionMode: 'multi-day',
      daysCount: 4,
      groupSize: { min: 4, max: 14 },
      campingAllowed: true,
      dailyDistanceLimits: { min: 10, max: 25 },
      pace: 'slow',
      terrainPreference: 'moderate',
      reportExport: 'all',
    },
  },
]

/** Merge a partial preset over the defaults to produce a full config. */
export function applyPreset(partial: Partial<ExpeditionConfig>): ExpeditionConfig {
  return {
    ...defaultConfig,
    ...partial,
    // Nested objects need explicit merge so a preset can override just one key.
    groupSize: { ...defaultConfig.groupSize, ...partial.groupSize },
    dailyDistanceLimits: {
      ...defaultConfig.dailyDistanceLimits,
      ...partial.dailyDistanceLimits,
    },
    surfaceWeights: { ...defaultConfig.surfaceWeights, ...partial.surfaceWeights },
    weatherThresholds: {
      ...defaultConfig.weatherThresholds,
      ...partial.weatherThresholds,
    },
  }
}

export function findPreset(id: string): PresetBundle | undefined {
  return builtInPresets.find((p) => p.id === id)
}
