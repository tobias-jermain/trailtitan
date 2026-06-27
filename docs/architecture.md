# Architecture

## Overview

TrailTitan is an **Electron 31 + React 18** desktop application built with `electron-vite`. It targets Windows and ships as an NSIS `.exe` installer via `electron-builder`.

```
TrailTitan.exe
  ├── Main Process (Node.js)
  │     ├── ipc/routing.ts    → ORS API calls (HTTP, key stays here)
  │     ├── ipc/export.ts     → GPX / PDF / CSV write to disk
  │     └── ipc/config.ts     → electron-store read/write
  │
  └── Renderer Process (Chromium, React)
        ├── Pages: Home, Planner, RouteView, ExportView
        ├── Zustand store (in-memory expedition state)
        └── window.trailtitan → IPC calls via context bridge
```

The renderer **never makes HTTP calls directly**. All external I/O goes through the IPC bridge. This keeps the ORS API key out of Chromium's DevTools Network tab.

---

## Process Boundary

### Main process entry (`electron/main.ts`)

- Creates the `BrowserWindow`
- Registers IPC handlers (`ipcMain.handle`)
- Initialises `electron-store` for app config
- Sets up `electron-updater` on `app.ready`

### Context bridge (`electron/preload.ts`)

Exposes a narrow, typed API to the renderer. The renderer never imports `ipcRenderer` — it only sees `window.trailtitan`:

```ts
interface TrailTitanAPI {
  generateRoute:  (waypoints: Waypoint[], config: ExpeditionConfig) => Promise<ORSRouteResult>
  exportGpx:      (route: GeneratedRoute) => Promise<{ path: string } | null>
  exportPdf:      (route: GeneratedRoute) => Promise<{ path: string } | null>
  exportCsv:      (route: GeneratedRoute) => Promise<{ path: string } | null>
  getConfig:      () => Promise<AppConfig>
  setConfig:      (patch: Partial<AppConfig>) => Promise<void>
}
```

Each method opens a native dialog where appropriate (save dialogs for export).

---

## Folder Structure

```
electron/
  main.ts
  preload.ts
  ipc/
    routing.ts       # ipcMain.handle('routing:generate', ...)
    export.ts        # ipcMain.handle('export:gpx', ...) etc.
    config.ts        # ipcMain.handle('config:get', ...) etc.

src/
  app/
    App.tsx          # Root: router (react-router-dom) + Zustand provider
    pages/
      Home.tsx       # Landing: preset picker, recent routes
      Planner.tsx    # Main layout: WizardSidebar + MapPanel
      RouteView.tsx  # Read-only saved route
      ExportView.tsx # Export preview + download buttons
  components/
    map/
      RouteMap.tsx          # react-leaflet map, manages tile layer + markers
      WaypointMarker.tsx    # Draggable marker, fires onMove callback
      RoutePolyline.tsx     # Renders ORS GeoJSON LineString
      ElevationProfile.tsx  # recharts AreaChart below the map
    planner/
      WizardSidebar.tsx     # Step indicator + active step renderer
      Step1_Setup.tsx       # expeditionMode, daysCount, groupSize
      Step2_Terrain.tsx     # terrainPreference, pace, elevationBudget, surfaceWeights
      Step3_Checkpoints.tsx # checkpoints[], resupplyPoints[], campingAllowed
      Step4_Review.tsx      # Validation summary, generate button
    export/
      RouteReport.tsx       # Printable route card (mirrors PDF layout)
    ui/                     # shadcn/ui components — regenerate, don't edit
  lib/
    routing/
      ors-client.ts         # Calls window.trailtitan.generateRoute (IPC)
      naismith.ts           # Walking time calculator
      elevation.ts          # Per-segment ascent/descent utils
      mock-route.ts         # Static sample route for demo mode
    config/
      schema.ts             # Zod ExpeditionConfig schema
      defaults.ts           # Default ExpeditionConfig values
      presets.ts            # Named preset bundles (Partial<ExpeditionConfig>)
    store/
      expedition.ts         # Zustand: config, route, validation, presets
      app.ts                # Zustand: appConfig (mirrors electron-store)
    export/
      gpx.ts                # Builds GPX XML string from GeneratedRoute
      pdf.ts                # Builds jsPDF document from GeneratedRoute
      csv.ts                # Builds CSV string from GeneratedRoute
  types/
    expedition.ts           # ExpeditionConfig, GeneratedRoute, Waypoint, etc.
    app.ts                  # AppConfig, SavedRoute, UserPreset
```

---

## State Management

### `expedition` store

```ts
interface ExpeditionStore {
  config:            ExpeditionConfig
  waypoints:         Waypoint[]
  route:             GeneratedRoute | null
  validationErrors:  ValidationError[]
  isGenerating:      boolean

  updateConfig:      (patch: Partial<ExpeditionConfig>) => void
  setWaypoints:      (waypoints: Waypoint[]) => void
  generateRoute:     () => Promise<void>   // calls IPC
  resetRoute:        () => void
  loadPreset:        (name: string) => void
  saveUserPreset:    (name: string) => void
}
```

### `app` store

Mirrors `AppConfig` from `electron-store`. Loaded once on startup via `window.trailtitan.getConfig()`. Writes go back through IPC on change.

---

## Config System

### Schema (`src/lib/config/schema.ts`)

`ExpeditionConfig` is a Zod object. The wizard renders fields from it; validation runs `schema.safeParse(config)` and surfaces errors inline.

Key types:

```ts
const ExpeditionConfig = z.object({
  expeditionMode:        z.enum(['day', 'multi-day', 'basecamp']),
  daysCount:             z.number().int().min(1).max(14),
  groupSize:             z.object({ min: z.number().int().min(1), max: z.number().int().min(1) }),
  pace:                  z.enum(['slow', 'moderate', 'fast']),
  dailyDistanceLimits:   z.object({ min: z.number().min(0), max: z.number().positive() }),
  elevationBudgetPerDay: z.number().positive(),
  terrainPreference:     z.enum(['low', 'moderate', 'challenging', 'any']),
  surfaceWeights:        SurfaceWeightsSchema,
  checkpoints:           z.array(CheckpointSchema),
  campingAllowed:        z.boolean(),
  wildcampingAllowed:    z.boolean(),
  resupplyPoints:        z.array(ResupplyPointSchema),
  weatherThresholds:     WeatherThresholdsSchema,
  reportExport:          z.enum(['none', 'gpx', 'pdf', 'csv', 'all']),
  emergencyContacts:     z.array(EmergencyContactSchema),
})
```

### Presets (`src/lib/config/presets.ts`)

Named `Partial<ExpeditionConfig>` objects merged over `defaults`. Five ship built-in; users add their own via the Settings panel (persisted in `AppConfig.userPresets`).

---

## IPC Handlers

### `routing:generate`

```
Renderer → IPC → Main → ORS API → Main → IPC → Renderer
```

1. Renderer calls `window.trailtitan.generateRoute(waypoints, config)`
2. Main reads `orsApiKey` from `electron-store`
3. If key is empty: returns `mockRoute` immediately
4. Otherwise: POSTs to `https://api.openrouteservice.org/v2/directions/foot-hiking/geojson`
5. Parses response into `ORSRouteResult` and returns it

### `export:gpx` / `export:pdf` / `export:csv`

1. Renderer calls the appropriate method
2. Main opens `dialog.showSaveDialog` with a default filename
3. If user confirms: builds the file content (in main process) and writes it with `fs.writeFile`
4. Returns `{ path }` on success, `null` if user cancelled

### `config:get` / `config:set`

Thin wrapper around `electron-store`. `config:set` merges the patch and persists.

---

## Naismith Calculator

`src/lib/routing/naismith.ts`

```ts
const PACE_MULTIPLIERS = { slow: 1.5, moderate: 1.0, fast: 0.75 }
const BASE_SPEED_KPH   = 5          // flat, moderate pace
const ASCENT_MIN_PER_M = 1 / 10    // 1 minute per 10 m ascent (Naismith)

function naismithTime(distanceKm: number, ascentM: number, pace: Pace): number {
  const multiplier   = PACE_MULTIPLIERS[pace]
  const walkMinutes  = (distanceKm / BASE_SPEED_KPH) * 60 * multiplier
  const climbMinutes = ascentM * ASCENT_MIN_PER_M
  return Math.round(walkMinutes + climbMinutes)
}
```

---

## Export Formats

### GPX (`src/lib/export/gpx.ts`)

- GPX 1.1 `<trk>` with one `<trkseg>` per day
- `<wpt>` elements for each checkpoint and resupply point
- Route metadata (name, description, total distance) in `<metadata>`

### PDF (`src/lib/export/pdf.ts`)

Generated with jsPDF. Sections:
1. Header: route name, planned date, branding
2. Overview: total distance, ascent, descent, estimated time, group size
3. Stage table: one row per day — From, To, Distance, Ascent, Est. Time
4. Checkpoints table: Name, Grid ref, Arrival window
5. Emergency contacts
6. Footer: generated-by + page numbers

### CSV (`src/lib/export/csv.ts`)

Columns: `Day, From, To, Distance (km), Ascent (m), Descent (m), Est. Time (mins), Checkpoints`

---

## Installer (NSIS)

`electron-builder` config in `package.json`:

```json
{
  "build": {
    "appId": "com.trailtitan.app",
    "productName": "TrailTitan",
    "win": {
      "icon": "build/icon.ico",
      "target": "nsis"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

---

## CI / Releases

GitHub Actions workflow (`.github/workflows/release.yml`):

1. Triggered on `push` to a `v*` tag
2. `npm run build` → `npm run dist`
3. Uploads `release/TrailTitan-Setup.exe` as a GitHub Release asset
4. `electron-updater` in the app checks the release feed on startup

---

## Testing Strategy

| Layer | Tool | What's covered |
|---|---|---|
| Config schema | Vitest | Valid/invalid objects, edge cases, coercion |
| Naismith calc | Vitest | Known input/output pairs |
| GPX builder | Vitest | Valid XML, correct structure, multi-day splits |
| PDF builder | Vitest (mocked jsPDF) | Section presence, no throws |
| CSV builder | Vitest | Column names, row count, encoding |
| Wizard steps | React Testing Library | Field rendering, conditional visibility, validation messages |
| Map components | Vitest (mocked leaflet) | Marker count, polyline coordinates |
| IPC handlers | Vitest (mocked electron) | Routing fallback to mock, save dialog paths |
