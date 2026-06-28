import { create } from 'zustand'
import type {
  ExpeditionConfig,
  GeneratedRoute,
  Waypoint,
} from '@/types/expedition'
import { defaultConfig } from '@/lib/config/defaults'
import { applyPreset, findPreset } from '@/lib/config/presets'
import { generateRoute as ipcGenerateRoute } from '@/lib/routing/ors-client'
import {
  validateConfig,
  validateRoute,
  type ValidationItem,
} from '@/lib/validation'

export interface ExpeditionStore {
  config: ExpeditionConfig
  waypoints: Waypoint[]
  route: GeneratedRoute | null
  validation: ValidationItem[]
  isGenerating: boolean
  generationError: string | null

  updateConfig: (patch: Partial<ExpeditionConfig>) => void
  setWaypoints: (waypoints: Waypoint[]) => void
  addWaypoint: (coordinates: [number, number]) => void
  moveWaypoint: (id: string, coordinates: [number, number]) => void
  removeWaypoint: (id: string) => void
  loadPreset: (id: string) => void
  loadConfig: (config: ExpeditionConfig) => void
  generate: () => Promise<void>
  resetRoute: () => void
}

let waypointSeq = 0
function nextWaypointId(): string {
  waypointSeq += 1
  return `wp-${Date.now()}-${waypointSeq}`
}

export const useExpeditionStore = create<ExpeditionStore>((set, get) => ({
  config: defaultConfig,
  waypoints: [],
  route: null,
  validation: [],
  isGenerating: false,
  generationError: null,

  updateConfig: (patch) =>
    set((state) => {
      const config = { ...state.config, ...patch }
      return { config, validation: validateConfig(config) }
    }),

  setWaypoints: (waypoints) => set({ waypoints }),

  addWaypoint: (coordinates) =>
    set((state) => ({
      waypoints: [
        ...state.waypoints,
        {
          id: nextWaypointId(),
          coordinates,
          label: `Waypoint ${state.waypoints.length + 1}`,
        },
      ],
    })),

  moveWaypoint: (id, coordinates) =>
    set((state) => ({
      waypoints: state.waypoints.map((w) =>
        w.id === id ? { ...w, coordinates } : w,
      ),
    })),

  removeWaypoint: (id) =>
    set((state) => ({
      waypoints: state.waypoints.filter((w) => w.id !== id),
    })),

  loadPreset: (id) => {
    const preset = findPreset(id)
    if (!preset) return
    const config = applyPreset(preset.config)
    set({ config, validation: validateConfig(config) })
  },

  loadConfig: (config) => set({ config, validation: validateConfig(config) }),

  generate: async () => {
    const { config, waypoints } = get()
    set({ isGenerating: true, generationError: null })
    try {
      const route = await ipcGenerateRoute(waypoints, config)
      set({
        route,
        isGenerating: false,
        validation: validateRoute(route, config),
      })
    } catch (err) {
      set({
        isGenerating: false,
        generationError: err instanceof Error ? err.message : String(err),
      })
    }
  },

  resetRoute: () => set({ route: null, validation: [] }),
}))
