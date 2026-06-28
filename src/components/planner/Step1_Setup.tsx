import { useExpeditionStore } from '@/lib/store/expedition'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from './Field'

/** Step 1 — Expedition setup: mode, days, group size, pace. */
export function Step1Setup() {
  const config = useExpeditionStore((s) => s.config)
  const updateConfig = useExpeditionStore((s) => s.updateConfig)
  const isMultiDay = config.expeditionMode === 'multi-day'

  return (
    <div className="space-y-5">
      <Field label="Expedition mode" htmlFor="mode" hint="Controls which planning options apply.">
        <Select
          id="mode"
          value={config.expeditionMode}
          onChange={(e) => {
            const mode = e.target.value as typeof config.expeditionMode
            updateConfig({
              expeditionMode: mode,
              daysCount: mode === 'day' ? 1 : Math.max(2, config.daysCount),
            })
          }}
        >
          <option value="day">Day — single-day walk</option>
          <option value="multi-day">Multi-day — consecutive hiking days</option>
          <option value="basecamp">Basecamp — day walks from a fixed base</option>
        </Select>
      </Field>

      {isMultiDay && (
        <Field label="Number of days" htmlFor="days" hint="Between 1 and 14.">
          <Input
            id="days"
            type="number"
            min={1}
            max={14}
            value={config.daysCount}
            onChange={(e) =>
              updateConfig({
                daysCount: clampInt(e.target.value, 1, 14),
              })
            }
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Min group size" htmlFor="gmin">
          <Input
            id="gmin"
            type="number"
            min={1}
            value={config.groupSize.min}
            onChange={(e) =>
              updateConfig({
                groupSize: {
                  ...config.groupSize,
                  min: clampInt(e.target.value, 1, 999),
                },
              })
            }
          />
        </Field>
        <Field label="Max group size" htmlFor="gmax">
          <Input
            id="gmax"
            type="number"
            min={1}
            value={config.groupSize.max}
            onChange={(e) =>
              updateConfig({
                groupSize: {
                  ...config.groupSize,
                  max: clampInt(e.target.value, 1, 999),
                },
              })
            }
          />
        </Field>
      </div>

      <Field label="Pace" htmlFor="pace" hint="Naismith multiplier applied to walking-time estimates.">
        <Select
          id="pace"
          value={config.pace}
          onChange={(e) =>
            updateConfig({ pace: e.target.value as typeof config.pace })
          }
        >
          <option value="slow">Slow — ~3.3 km/h flat</option>
          <option value="moderate">Moderate — ~5.0 km/h flat</option>
          <option value="fast">Fast — ~6.7 km/h flat</option>
        </Select>
      </Field>
    </div>
  )
}

function clampInt(value: string, min: number, max: number): number {
  const n = Math.round(Number(value))
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}
