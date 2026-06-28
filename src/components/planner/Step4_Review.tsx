import { useExpeditionStore } from '@/lib/store/expedition'
import { validateConfig } from '@/lib/validation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, Loader2, MapPin } from 'lucide-react'

/** Step 4 — Review: config summary, validation, generate. */
export function Step4Review() {
  const config = useExpeditionStore((s) => s.config)
  const waypoints = useExpeditionStore((s) => s.waypoints)
  const isGenerating = useExpeditionStore((s) => s.isGenerating)
  const generationError = useExpeditionStore((s) => s.generationError)
  const generate = useExpeditionStore((s) => s.generate)

  const configErrors = validateConfig(config)
  const canGenerate = configErrors.length === 0 && !isGenerating

  const summary: [string, string][] = [
    ['Mode', config.expeditionMode],
    ['Days', String(config.daysCount)],
    ['Group', `${config.groupSize.min}–${config.groupSize.max}`],
    ['Pace', config.pace],
    ['Terrain', config.terrainPreference],
    ['Distance/day', `${config.dailyDistanceLimits.min}–${config.dailyDistanceLimits.max} km`],
    ['Ascent budget', `${config.elevationBudgetPerDay} m`],
    ['Checkpoints', String(config.checkpoints.length)],
    ['Waypoints placed', String(waypoints.length)],
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-4 text-sm">
        {summary.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium capitalize">{v}</span>
          </div>
        ))}
      </div>

      {configErrors.length > 0 ? (
        <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" /> Fix before generating
          </p>
          <ul className="space-y-1 text-xs text-destructive">
            {configErrors.map((e, i) => (
              <li key={i}>
                <span className="font-mono">{e.field}</span>: {e.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> Config is valid.
        </p>
      )}

      {waypoints.length === 0 && (
        <p className="flex items-center gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          No waypoints placed — a demo route will be generated. Click the map to
          add your own, or add an API key in Settings for live routing.
        </p>
      )}

      {generationError && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          {generationError}
        </p>
      )}

      <Button
        variant="brand"
        size="lg"
        className="w-full"
        disabled={!canGenerate}
        onClick={() => generate()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Generating…
          </>
        ) : (
          'Generate route'
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        <Badge variant="outline">Naismith</Badge> walking times update from your
        pace and each stage&apos;s ascent.
      </p>
    </div>
  )
}
