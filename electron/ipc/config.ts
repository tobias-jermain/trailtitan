import { ipcMain } from 'electron'
import Store from 'electron-store'
import type { AppConfig } from '@/types/app'
import { appConfigDefaults } from '@/types/app'

/**
 * electron-store-backed app config. Persisted to
 * %APPDATA%/Trailtitan/config.json. The ORS API key lives here and is only
 * ever read inside the main process — never serialised to a network request
 * the renderer can see.
 */
const store = new Store<AppConfig>({
  name: 'config',
  defaults: appConfigDefaults,
})

export function getAppConfig(): AppConfig {
  return store.store
}

export function registerConfigHandlers(): void {
  ipcMain.handle('config:get', (): AppConfig => store.store)

  ipcMain.handle(
    'config:set',
    (_event, patch: Partial<AppConfig>): AppConfig => {
      for (const [key, value] of Object.entries(patch)) {
        store.set(key as keyof AppConfig, value as never)
      }
      return store.store
    },
  )
}
