# Config Schema Reference

Full reference for `ExpeditionConfig` — defined in `src/lib/config/schema.ts` using Zod.

---

## `expeditionMode`
`'day' | 'multi-day' | 'basecamp'`

Controls which wizard sections are shown and which constraints apply.

- `day` — single-day walk; camping, resupply, and per-day staging fields are hidden.
- `multi-day` — multiple consecutive hiking days; unlocks `daysCount`, camping, resupply, and per-day limits.
- `basecamp` — fixed overnight base with day walks radiating from it; unlocks base location and per-walk config.

**Default:** `'day'`

---

## `daysCount`
`number` (integer, 1–14)

Number of hiking days. Only relevant in `multi-day` mode.

**Default:** `1`

---

## `groupSize`
`{ min: number; max: number }`

Acceptable group size range. The app warns if the planned group count falls outside this window.

**Default:** `{ min: 1, max: 6 }`

---

## `pace`
`'slow' | 'moderate' | 'fast'`

Naismith time multiplier applied to all walking time estimates.

| Pace | Multiplier | Effective flat speed |
|---|---|---|
| `slow` | 1.5× | ~3.3 km/h |
| `moderate` | 1.0× | ~5.0 km/h |
| `fast` | 0.75× | ~6.7 km/h |

**Default:** `'moderate'`

---

## `dailyDistanceLimits`
`{ min: number; max: number }` (km)

Per-day distance range. A validation warning appears if any stage falls outside this range.

**Default:** `{ min: 0, max: 40 }`

---

## `elevationBudgetPerDay`
`number` (metres of ascent)

Maximum permitted total ascent per day. Exceeding this triggers a warning.

**Default:** `1500`

---

## `terrainPreference`
`'low' | 'moderate' | 'challenging' | 'any'`

Controls ORS route weighting and the difficulty warning threshold.

| Value | Effect |
|---|---|
| `low` | Prefer gentle paths; warn on any steep section |
| `moderate` | Standard hiking paths preferred |
| `challenging` | Steep or rough terrain accepted |
| `any` | No surface or gradient filtering |

**Default:** `'moderate'`

---

## `surfaceWeights`
```ts
{
  footpath:   number  // 0–1
  bridleway:  number  // 0–1
  track:      number  // 0–1
  road:       number  // 0–1
}
```

Relative preference for each surface type, passed to ORS as custom weightings. Higher = more preferred.

**Default:** `{ footpath: 0.8, bridleway: 0.6, track: 0.4, road: 0.1 }`

---

## `checkpoints`
`CheckpointConfig[]`

Required waypoints along the route. Each:

```ts
{
  id:           string
  name:         string
  coordinates:  [number, number]     // [lng, lat]
  arrivalWindow?: {
    earliest: string  // "HH:MM"
    latest:   string  // "HH:MM"
  }
  notes?: string
}
```

Checkpoints appear as map markers and in the PDF route card. Arrival window violations are flagged based on the Naismith estimate from the start of that day.

**Default:** `[]`

---

## `campingAllowed`
`boolean`

Whether overnight camping is part of the plan. Enables multi-day routes that don't require accommodation proximity.

**Default:** `false`

---

## `wildcampingAllowed`
`boolean`

Whether camping away from designated sites is permitted. Only meaningful when `campingAllowed` is `true`.

**Default:** `false`

---

## `resupplyPoints`
`ResupplyPoint[]`

Named waypoints for food or gear resupply. Shown on the map and included in the PDF.

```ts
{
  id:          string
  name:        string
  coordinates: [number, number]
  day:         number    // which hiking day this falls on (1-indexed)
  notes?:      string
}
```

**Default:** `[]`

---

## `weatherThresholds`
```ts
{
  enabled:             boolean
  maxWindSpeedKph:     number
  maxRainfallMmPerHr:  number
  minVisibilityKm:     number
}
```

When `enabled`, the app fetches an Open-Meteo forecast for the planned date and shows a go/no-go warning if any value exceeds these thresholds. Requires an internet connection.

**Default:** `{ enabled: false, maxWindSpeedKph: 50, maxRainfallMmPerHr: 10, minVisibilityKm: 2 }`

---

## `reportExport`
`'none' | 'gpx' | 'pdf' | 'csv' | 'all'`

Which export options are shown on the Export page.

**Default:** `'gpx'`

---

## `emergencyContacts`
`EmergencyContact[]`

Contacts printed in the PDF route card footer.

```ts
{
  name:  string
  role:  string   // e.g. "Group Leader", "Base Contact"
  phone: string
}
```

**Default:** `[]`

---

## Built-in Presets

Presets are `Partial<ExpeditionConfig>` merged over defaults. Defined in `src/lib/config/presets.ts`.

### `day-walk`
```json
{
  "expeditionMode": "day",
  "daysCount": 1,
  "groupSize": { "min": 1, "max": 6 },
  "pace": "moderate",
  "dailyDistanceLimits": { "min": 5, "max": 25 },
  "terrainPreference": "moderate"
}
```

### `weekend-trek`
```json
{
  "expeditionMode": "multi-day",
  "daysCount": 2,
  "groupSize": { "min": 1, "max": 6 },
  "campingAllowed": true,
  "dailyDistanceLimits": { "min": 10, "max": 30 },
  "pace": "moderate"
}
```

### `long-distance-trek`
```json
{
  "expeditionMode": "multi-day",
  "daysCount": 5,
  "groupSize": { "min": 1, "max": 6 },
  "campingAllowed": true,
  "dailyDistanceLimits": { "min": 15, "max": 35 },
  "terrainPreference": "any"
}
```

### `alpine-day`
```json
{
  "expeditionMode": "day",
  "daysCount": 1,
  "groupSize": { "min": 1, "max": 4 },
  "pace": "slow",
  "terrainPreference": "challenging",
  "elevationBudgetPerDay": 2500
}
```

### `group-expedition`
```json
{
  "expeditionMode": "multi-day",
  "daysCount": 4,
  "groupSize": { "min": 4, "max": 14 },
  "campingAllowed": true,
  "dailyDistanceLimits": { "min": 10, "max": 25 },
  "pace": "slow",
  "terrainPreference": "moderate",
  "reportExport": "all"
}
```
