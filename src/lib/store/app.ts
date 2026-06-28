import { create } from 'zustand'
import type { AppConfig, SavedRoute, ThemePreference } from '@/types/app'
import { appConfigDefaults } from '@/types/app'
import type { GeneratedRoute } from '@/types/expedition'

export interface AppStore {
  config: AppConfig
  loaded: boolean

  load: () => Promise<void>
  patch: (patch: Partial<AppConfig>) => Promise<void>
  setTheme: (theme: ThemePreference) => Promise<void>
  setApiKey: (orsApiKey: string) => Promise<void>
  saveRoute: (route: GeneratedRoute, name?: string) => Promise<void>
  deleteRoute: (id: string) => Promise<void>
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const useAppStore = create<AppStore>((set, get) => ({
  config: appConfigDefaults,
  loaded: false,

  load: async () => {
    const config = await window.trailtitan.getConfig()
    set({ config, loaded: true })
    applyTheme(config.theme)
  },

  patch: async (patch) => {
    const config = await window.trailtitan.setConfig(patch)
    set({ config })
  },

  setTheme: async (theme) => {
    await get().patch({ theme })
    applyTheme(theme)
  },

  setApiKey: async (orsApiKey) => {
    await get().patch({ orsApiKey })
  },

  saveRoute: async (route, name) => {
    const saved: SavedRoute = {
      id: uid('saved'),
      name: name ?? route.name,
      savedAt: new Date().toISOString(),
      route,
    }
    const savedRoutes = [saved, ...get().config.savedRoutes]
    await get().patch({ savedRoutes })
  },

  deleteRoute: async (id) => {
    const savedRoutes = get().config.savedRoutes.filter((r) => r.id !== id)
    await get().patch({ savedRoutes })
  },
}))

/** Apply a theme preference to the document root. */
export function applyTheme(theme: ThemePreference): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', dark)
}
