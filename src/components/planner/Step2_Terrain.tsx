import { useExpeditionStore } from '@/lib/store/expedition'
import type { SurfaceWeights } from '@/types/expedition'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from './Field'

const SURFACES: { key: keyof SurfaceWeights; label: string }[] = [
  { key: 'footpath', label: 'Footpath' },
  { key: 'bridleway', label: 'Bridleway' },
  { key: 'track', label: 'Track' },
  { key: 'road', label: 'Road' },
]

/** Step 2 — Terrain & pace: terrain preference, limits, surface weights. */
export function Step2Terrain() {
  const config = useExpeditionStore((s) => s.config)
  const updateConfig = useExpeditionStore((s) => s.updateConfig)

  return (
    <div className="space-y-5">
      <Field
        label="Terrain preference"
        htmlFor="terrain"
        hint="Weights route selection and the difficulty warning threshold."
      >
        <Select
          id="terrain"
          value={config.terrainPreference}
          onChange={(e) =>
            updateConfig({
              terrainPreference: e.target
                .value as typeof config.terrainPreference,
            })
          }
        >
          <option value="low">Low — gentle paths preferred</option>
          <option value="moderate">Moderate — standard hiking paths</option>
          <option value="challenging">Challenging — steep / rough accepted</option>
          <option value="any">Any — no filtering</option>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Min distance / day (km)" htmlFor="dmin">
          <Input
            id="dmin"
            type="number"
            min={0}
            value={config.dailyDistanceLimits.min}
            onChange={(e) =>
              updateConfig({
                dailyDistanceLimits: {
                  ...config.dailyDistanceLimits,
                  min: clampNum(e.target.value, 0),
                },
              })
            }
          />
        </Field>
        <Field label="Max distance / day (km)" htmlFor="dmax">
          <Input
            id="dmax"
            type="number"
            min={1}
            value={config.dailyDistanceLimits.max}
            onChange={(e) =>
              updateConfig({
                dailyDistanceLimits: {
                  ...config.dailyDistanceLimits,
                  max: clampNum(e.target.value, 1),
                },
              })
            }
          />
        </Field>
      </div>

      <Field
        label="Ascent budget / day (m)"
        htmlFor="elev"
        hint="Stages climbing more than this are flagged."
      >
        <Input
          id="elev"
          type="number"
          min={1}
          value={config.elevationBudgetPerDay}
          onChange={(e) =>
            updateConfig({ elevationBudgetPerDay: clampNum(e.target.value, 1) })
          }
        />
      </Field>

      <div className="space-y-2">
        <p className="text-sm font-medium">Surface weighting</p>
        <p className="text-xs text-muted-foreground">
          Relative preference for each surface (0–1). Higher is more preferred.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-1">
          {SURFACES.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>{label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {config.surfaceWeights[key].toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={config.surfaceWeights[key]}
                onChange={(e) =>
                  updateConfig({
                    surfaceWeights: {
                      ...config.surfaceWeights,
                      [key]: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-brand-teal"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function clampNum(value: string, min: number): number {
  const n = Number(value)
  if (Number.isNaN(n)) return min
  return Math.max(min, n)
}
