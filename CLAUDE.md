# Trailtitan — Claude Code Guide

## Project Overview

Trailtitan is a **Windows desktop application** for hiking route planning and expedition management. It ships as an NSIS `.exe` installer built with Electron + React. It is open source with retained branding.

Every constraint, limit, and workflow is driven by a typed config schema. No specific expedition programme, award scheme, or organisation is ever named or hardcoded in the repository.

## Tech Stack

| Layer | Choice |
|---|---|
| Desktop shell | Electron 31 |
| Frontend | React 18 + TypeScript (strict) |
| Build tooling | Vite + electron-vite |
| Styling | Tailwind CSS + shadcn/ui |
| Maps | react-leaflet + Leaflet.js (offline tile support via MBTiles) |
| Routing API | OpenRouteService HTTP API (key stored in local app config) |
| State | Zustand |
| Validation | Zod |
| Export | jsPDF (PDF), custom GPX builder, Papa Parse (CSV) |
| Installer | electron-builder → NSIS `.exe` |
| Testing | Vitest + React Testing Library |
| CI | GitHub Actions (build + sign + release) |

## Repository Structure

```
trailtitan/
  electron/
    main.ts               # Electron main process entry
    preload.ts            # Context bridge (IPC API surface)
    ipc/
      routing.ts          # IPC handler: proxies ORS API calls (keeps key off renderer)
      export.ts           # IPC handler: writes GPX/PDF/CSV to disk
      config.ts           # IPC handler: reads/writes app config to userData
  src/                    # React renderer process
    app/
      App.tsx             # Root; wraps router + providers
      pages/
        Home.tsx          # Landing / preset picker
        Planner.tsx       # Main planner: wizard sidebar + map
        RouteView.tsx     # Read-only saved route view
        ExportView.tsx    # Export / print view
    components/
      map/                # RouteMap, WaypointMarker, ElevationProfile
      planner/            # Wizard step components (Steps 1–4)
      export/             # RouteReport (PDF preview)
      ui/                 # shadcn/ui primitives (do not edit manually)
    lib/
      routing/            # ORS client (IPC), Naismith calc, elevation utils
      config/             # Zod schema, defaults, preset bundles
      store/              # Zustand stores
      export/             # GPX builder, PDF builder, CSV builder
    types/                # Shared TypeScript types
  docs/                   # Architecture & developer docs
  public/                 # Static assets (logo, icons)
  build/                  # Installer assets (NSIS script, icons)
  release/                # Built installers (git-ignored)
```

## Key Conventions

- **Config-first**: all tuneable behaviour lives in `src/lib/config/schema.ts` (Zod) and `src/lib/config/defaults.ts`. Never hardcode limits in UI components.
- **No programme names**: the app is generic. Features like multi-day staging, checkpoint windows, and group management are described in neutral terms only.
- **Preset bundles**: named configs live in `src/lib/config/presets.ts` and are user-selectable.
- **API key in userData**: the ORS API key is stored in the OS `userData` folder via `electron-store`, never in the repo or env files.
- **IPC boundary**: the renderer never calls the ORS API directly. All external HTTP happens in the main process via `ipc/routing.ts`. This keeps the key out of DevTools.
- **Export writes to disk**: export handlers run in the main process and open a native save dialog.
- **Branch naming**: branches must follow the `<type>/<short-description>` convention. Use lowercase kebab-case for the description. Examples: `feature/walking-modes`, `ui/run-button`, `fix/elevation-crash`, `chore/update-deps`, `docs/ipc-design`. Do not use bare names like `patch`, `update`, or `fix` without a descriptive suffix.

## App Config (userData)

Stored via `electron-store` at `%APPDATA%/Trailtitan/config.json`:

```jsonc
{
  "orsApiKey": "",           // user enters this in Settings
  "theme": "system",         // "light" | "dark" | "system"
  "defaultPreset": "day-walk",
  "savedRoutes": [],         // array of SavedRoute objects
  "userPresets": []          // user-created preset bundles
}
```

## Development Commands

```bash
npm install
npm run dev          # Electron dev mode (hot reload on renderer changes)
npm run build        # Production build
npm run dist         # Build + package → release/Trailtitan-Setup.exe
npm run type-check   # tsc --noEmit (both electron/ and src/)
npm run test         # Vitest (renderer logic only; main process tested via integration)
npm run lint         # ESLint
```

## Architecture Notes

### IPC Design

The context bridge exposes a narrow typed API to the renderer:

```ts
// preload.ts
contextBridge.exposeInMainWorld('trailtitan', {
  generateRoute: (waypoints, config) => ipcRenderer.invoke('routing:generate', waypoints, config),
  exportGpx:     (route, path)       => ipcRenderer.invoke('export:gpx', route, path),
  exportPdf:     (route, path)       => ipcRenderer.invoke('export:pdf', route, path),
  exportCsv:     (route, path)       => ipcRenderer.invoke('export:csv', route, path),
  getConfig:     ()                  => ipcRenderer.invoke('config:get'),
  setConfig:     (patch)             => ipcRenderer.invoke('config:set', patch),
})
```

The renderer imports `window.trailtitan` — never `ipcRenderer` directly.

### Offline / Demo Mode

When `orsApiKey` is empty, `ipc/routing.ts` returns a hardcoded mock route. The renderer shows a Settings nudge. All other features work against the mock.

### Map Tiles

Default: OpenStreetMap tiles over HTTP (requires internet). Future: bundle MBTiles for offline use via `leaflet-mbtiles`.

### Installer (NSIS)

`electron-builder` config in `package.json` targets NSIS:

- Single-file installer
- Desktop + Start Menu shortcuts
- Uninstaller registered in Add/Remove Programs
- App icon from `build/icon.ico`
- Auto-updater via `electron-updater` + GitHub Releases

## Adding a New Config Option

1. Add field to `ExpeditionConfig` in `src/lib/config/schema.ts`.
2. Add default in `src/lib/config/defaults.ts`.
3. Wire UI control into the appropriate wizard step.
4. Update affected presets in `src/lib/config/presets.ts`.
5. Test in `src/lib/config/__tests__/schema.test.ts`.

## Do Not

- Hardcode distance limits, day counts, or group size rules outside the config schema.
- Reference any specific expedition programme, award scheme, or organisation anywhere in the codebase.
- Call external APIs from the renderer process — use IPC.
- Edit files inside `src/components/ui/` directly — regenerate via shadcn CLI.
- Commit API keys or `electron-store` config files.
- Commit anything under `release/`.
