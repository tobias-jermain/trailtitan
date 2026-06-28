import { contextBridge, ipcRenderer } from 'electron'
import type { ExpeditionConfig, GeneratedRoute, Waypoint } from '@/types/expedition'
import type { AppConfig } from '@/types/app'

/**
 * The single, narrow API surface the renderer is allowed to see. The renderer
 * never imports `ipcRenderer` directly — only `window.trailtitan`.
 */
const api = {
  generateRoute: (waypoints: Waypoint[], config: ExpeditionConfig) =>
    ipcRenderer.invoke('routing:generate', waypoints, config),
  exportGpx: (route: GeneratedRoute) => ipcRenderer.invoke('export:gpx', route),
  exportPdf: (route: GeneratedRoute) => ipcRenderer.invoke('export:pdf', route),
  exportCsv: (route: GeneratedRoute) => ipcRenderer.invoke('export:csv', route),
  getConfig: (): Promise<AppConfig> => ipcRenderer.invoke('config:get'),
  setConfig: (patch: Partial<AppConfig>): Promise<AppConfig> =>
    ipcRenderer.invoke('config:set', patch),
}

contextBridge.exposeInMainWorld('trailtitan', api)
