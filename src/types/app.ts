import type { ExpeditionConfig } from './expedition'
import type { GeneratedRoute } from './expedition'

export type ThemePreference = 'light' | 'dark' | 'system'

/** A user-created, named config bundle stored in app config. */
export interface UserPreset {
  id: string
  name: string
  description?: string
  config: ExpeditionConfig
}

/** A saved route, persisted in app config. */
export interface SavedRoute {
  id: string
  name: string
  savedAt: string
  route: GeneratedRoute
}

/**
 * Mirrors the electron-store config at %APPDATA%/Trailtitan/config.json.
 * The ORS API key lives here and is never committed or sent to the renderer
 * over the network — only read in the main process.
 */
export interface AppConfig {
  orsApiKey: string
  theme: ThemePreference
  defaultPreset: string
  savedRoutes: SavedRoute[]
  userPresets: UserPreset[]
}

export const appConfigDefaults: AppConfig = {
  orsApiKey: '',
  theme: 'system',
  defaultPreset: 'day-walk',
  savedRoutes: [],
  userPresets: [],
}
