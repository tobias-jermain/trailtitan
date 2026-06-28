import type { ExpeditionConfig, GeneratedRoute, Waypoint } from './expedition'
import type { AppConfig } from './app'

export interface TrailTitanAPI {
  generateRoute: (
    waypoints: Waypoint[],
    config: ExpeditionConfig,
  ) => Promise<{ ok: true; route: GeneratedRoute } | { ok: false; error: string }>
  exportGpx: (route: GeneratedRoute) => Promise<{ path: string } | null>
  exportPdf: (route: GeneratedRoute) => Promise<{ path: string } | null>
  exportCsv: (route: GeneratedRoute) => Promise<{ path: string } | null>
  getConfig: () => Promise<AppConfig>
  setConfig: (patch: Partial<AppConfig>) => Promise<AppConfig>
}

declare global {
  interface Window {
    trailtitan: TrailTitanAPI
  }
}

export {}
