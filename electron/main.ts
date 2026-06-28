import { join } from 'node:path'
import { app, BrowserWindow, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { registerConfigHandlers } from './ipc/config'
import { registerRoutingHandlers } from './ipc/routing'
import { registerExportHandlers } from './ipc/export'

const isDev = !app.isPackaged

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    backgroundColor: '#0f172a',
    title: 'TrailTitan',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  win.once('ready-to-show', () => win.show())

  // Open external links in the system browser, never in-app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerConfigHandlers()
  registerRoutingHandlers()
  registerExportHandlers()

  createWindow()

  if (!isDev) {
    // Best-effort update check; never blocks startup.
    autoUpdater.checkForUpdatesAndNotify().catch(() => undefined)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
