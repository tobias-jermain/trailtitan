<h3 align="center">
  <a name="readme-top"></a>
  <img src="public/logoColour.png" height="65" alt="Trailtitan" />
</h3>

<p align="center">
  Hiking route planning & expedition management. Download, install, and go.
</p>

<div align="center">
  <a href="https://github.com/tobias-jermain/trailtitan/releases/latest">
    <img src="https://img.shields.io/github/v/release/tobias-jermain/trailtitan" alt="Latest Release" />
  </a>
  <a href="https://github.com/tobias-jermain/trailtitan/releases/latest">
    <img src="https://img.shields.io/badge/platform-Windows-blue" alt="Platform: Windows" />
  </a>
  <a href="https://github.com/tobias-jermain/trailtitan/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/tobias-jermain/trailtitan.svg" alt="Contributors" />
  </a>
  <img src="https://img.shields.io/github/last-commit/tobias-jermain/trailtitan" alt="Last Commit" />
  <img src="https://img.shields.io/github/repo-size/tobias-jermain/trailtitan" alt="Repo Size" />
</div>

---

## What is TrailTitan?

TrailTitan is a **free, open-source Windows desktop application** for planning hiking routes and managing expeditions of any scale. Install it once, use it offline.

Every constraint — distance limits, daily ascent budgets, group size rules, checkpoint timing windows — is driven by a **fully customisable config**. Nothing is hardcoded. The same app works for a solo day walker and a group expedition leader.

---

## Download

**[Download the latest installer →](https://github.com/tobias-jermain/trailtitan/releases/latest)**

Runs on Windows 10 and 11. No account required. No cloud dependency.

> **Optional:** add a free [OpenRouteService API key](https://openrouteservice.org/dev/#/signup) in Settings to enable live route generation. The app works in demo mode without one.

---

## Features

- **Wizard-style planner** — four guided steps that adapt to your choices
- **Live interactive map** — place and drag waypoints, timings update in real-time
- **Naismith walking time** — configurable pace (slow / moderate / fast)
- **Elevation profile** — ascent and descent visualised per day and in total
- **Constraint validation** — per-day distance, ascent, and timing windows with inline warnings
- **Terrain preferences** — weight footpaths, bridleways, tracks, and roads separately
- **Checkpoint builder** — named waypoints with optional arrival time windows
- **Multi-day staging** — splits routes across days with per-day stats
- **Export to GPX** — import into any GPS device or app
- **Export to PDF** — printable route card with stage table and emergency contacts
- **Export to CSV** — stage-by-stage log for spreadsheets
- **Preset system** — save and reload named config bundles
- **Demo mode** — works fully offline without an API key

---

## Customisation

All behaviour is controlled by the **Expedition Config** — editable through the app's Settings panel or by editing the preset JSON directly. Key options:

| Option | Description | Default |
|---|---|---|
| `expeditionMode` | `day` / `multi-day` / `basecamp` | `day` |
| `daysCount` | Number of hiking days (1–14) | `1` |
| `groupSize` | `{ min, max }` participant count | `{ min: 1, max: 6 }` |
| `pace` | `slow` / `moderate` / `fast` (Naismith multiplier) | `moderate` |
| `dailyDistanceLimits` | `{ min, max }` km per day | `{ min: 0, max: 40 }` |
| `elevationBudgetPerDay` | Max ascent per day in metres | `1500` |
| `terrainPreference` | `low` / `moderate` / `challenging` / `any` | `moderate` |
| `checkpoints` | Named waypoints with optional arrival windows | `[]` |
| `campingAllowed` | Whether overnight camping is part of the plan | `false` |
| `wildcampingAllowed` | Wild camping permitted | `false` |
| `resupplyPoints` | Named waypoints for food/gear resupply | `[]` |
| `weatherThresholds` | Wind / rain limits that trigger warnings | see docs |
| `reportExport` | `none` / `gpx` / `pdf` / `csv` / `all` | `gpx` |
| `emergencyContacts` | Contacts printed on the PDF route card | `[]` |

Full reference: [`docs/config.md`](docs/config.md)

---

## Built-in Presets

| Preset | Mode | Days | Group | Terrain |
|---|---|---|---|---|
| Day Walk | day | 1 | 1–6 | moderate |
| Weekend Trek | multi-day | 2 | 1–6 | moderate |
| Long Distance Trek | multi-day | 5 | 1–6 | any |
| Alpine Day | day | 1 | 1–4 | challenging |
| Group Expedition | multi-day | 4 | 4–14 | moderate |

Presets are starting points — all fields remain editable.

---

## Building from Source

### Prerequisites

- Node.js 18+
- npm 9+

```bash
git clone https://github.com/tobias-jermain/trailtitan.git
cd trailtitan
npm install
```

### Dev mode

```bash
npm run dev
```

Opens the Electron window with hot reload.

### Build installer

```bash
npm run dist
```

Outputs `release/TrailTitan-Setup.exe`.

---

## Architecture

Electron + React. The renderer process never touches external APIs directly — all HTTP calls (ORS routing, weather) run in the main process via IPC so the API key stays out of DevTools.

See [`docs/architecture.md`](docs/architecture.md) for the full breakdown.

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Follow the conventions in [`CLAUDE.md`](CLAUDE.md)
4. Run `npm run type-check && npm run test && npm run lint`
5. Open a pull request

---
## Roadmap

Shipped in the MVP:

- [x] Project scaffold (electron-vite + React + Tailwind)
- [x] IPC architecture (main ↔ renderer bridge)
- [x] Config schema (Zod) + defaults + presets
- [x] App config persistence (electron-store)
- [x] Settings panel (API key, theme, default preset)
- [x] Planner wizard — Step 1: Expedition setup
- [x] Planner wizard — Step 2: Terrain & pace
- [x] Planner wizard — Step 3: Checkpoint builder
- [x] Planner wizard — Step 4: Review & generate
- [x] Interactive map (react-leaflet, ORS routing via IPC)
- [x] Elevation profile chart
- [x] Naismith time calculator
- [x] Constraint validation & inline warnings
- [x] Export: GPX (native save dialog)
- [x] Export: PDF route card
- [x] Export: CSV stage log
- [x] Preset load (in-app) + save generated routes
- [x] NSIS installer config (electron-builder)
- [x] GitHub Actions CI + auto-release on tag
- [x] Auto-updater wiring (electron-updater)

Planned next:

- [ ] In-app user preset save/edit
- [ ] Weather overlay (Open-Meteo, optional)
- [ ] Offline map tiles (MBTiles)
- [ ] macOS support (.dmg)

---

## License

MIT — see [LICENSE](LICENSE).
