import { writeFile } from 'node:fs/promises'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import type { GeneratedRoute } from '@/types/expedition'
import { buildGpx } from '@/lib/export/gpx'
import { buildCsv } from '@/lib/export/csv'
import { buildPdf } from '@/lib/export/pdf'

interface ExportSuccess {
  path: string
}

/** Slugify a route name into a safe default filename stem. */
function defaultStem(route: GeneratedRoute): string {
  return (
    route.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'trailtitan-route'
  )
}

async function promptAndWrite(
  route: GeneratedRoute,
  ext: string,
  filterName: string,
  data: string | Uint8Array,
): Promise<ExportSuccess | null> {
  const win = BrowserWindow.getFocusedWindow() ?? undefined
  const result = await dialog.showSaveDialog(win!, {
    title: `Export ${ext.toUpperCase()}`,
    defaultPath: `${defaultStem(route)}.${ext}`,
    filters: [{ name: filterName, extensions: [ext] }],
  })
  if (result.canceled || !result.filePath) return null
  await writeFile(result.filePath, data)
  return { path: result.filePath }
}

export function registerExportHandlers(): void {
  ipcMain.handle(
    'export:gpx',
    (_e, route: GeneratedRoute) =>
      promptAndWrite(route, 'gpx', 'GPX track', buildGpx(route)),
  )

  ipcMain.handle(
    'export:csv',
    (_e, route: GeneratedRoute) =>
      promptAndWrite(route, 'csv', 'CSV log', buildCsv(route)),
  )

  ipcMain.handle('export:pdf', (_e, route: GeneratedRoute) => {
    const doc = buildPdf(route)
    const bytes = new Uint8Array(doc.output('arraybuffer') as ArrayBuffer)
    return promptAndWrite(route, 'pdf', 'PDF route card', bytes)
  })
}
