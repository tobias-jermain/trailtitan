import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Info,
  Loader2,
  MapPin,
  MousePointerClick,
  Route as RouteIcon,
  Trash2,
} from 'lucide-react'
import { useExpeditionStore } from '@/lib/store/expedition'
import { useAppStore } from '@/lib/store/app'
import { WizardSidebar } from '@/components/planner/WizardSidebar'
import { RouteMap } from '@/components/map/RouteMap'
import { ElevationProfile } from '@/components/map/ElevationProfile'
import { formatDuration } from '@/lib/routing/naismith'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Planner() {
  const navigate = useNavigate()
  const waypoints = useExpeditionStore((s) => s.waypoints)
  const route = useExpeditionStore((s) => s.route)
  const validation = useExpeditionStore((s) => s.validation)
  const isGenerating = useExpeditionStore((s) => s.isGenerating)
  const generationError = useExpeditionStore((s) => s.generationError)
  const addWaypoint = useExpeditionStore((s) => s.addWaypoint)
  const moveWaypoint = useExpeditionStore((s) => s.moveWaypoint)
  const removeWaypoint = useExpeditionStore((s) => s.removeWaypoint)
  const clearWaypoints = useExpeditionStore((s) => s.clearWaypoints)
  const generate = useExpeditionStore((s) => s.generate)

  const hasApiKey = useAppStore((s) => Boolean(s.config.orsApiKey))

  const warnings = validation.filter((v) => v.severity === 'warning')
  // Live routing needs at least two points; demo mode can synthesise from any.
  const needsMoreWaypoints = hasApiKey && waypoints.length < 2

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[380px_1fr]">
      {/* Wizard */}
      <aside className="hidden border-r bg-card lg:block">
        <WizardSidebar />
      </aside>

      {/* Map + results */}
      <section className="flex h-full flex-col overflow-hidden">
        {/* Always-visible action bar so generating a route is obvious. */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-card px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-brand-teal" />
            <span>
              <span className="font-medium text-foreground">
                {waypoints.length}
              </span>{' '}
              waypoint{waypoints.length === 1 ? '' : 's'} placed
            </span>
            {waypoints.length > 0 && (
              <button
                onClick={clearWaypoints}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="brand"
              size="sm"
              disabled={isGenerating || needsMoreWaypoints}
              title={
                needsMoreWaypoints
                  ? 'Place at least two waypoints for live routing'
                  : undefined
              }
              onClick={() => generate()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <RouteIcon className="h-4 w-4" />
                  {route ? 'Regenerate' : 'Generate route'}
                </>
              )}
            </Button>
            {route && (
              <Button size="sm" variant="outline" onClick={() => navigate('/export')}>
                Export <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Demo-mode notice: explains the straight-line behaviour + how to fix. */}
        {!hasApiKey && (
          <div className="flex shrink-0 items-start gap-2 border-b bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              <span className="font-semibold">Demo mode.</span> Routes are drawn
              as straight lines between waypoints. Add a free OpenRouteService
              key to follow real trails.{' '}
              <button
                onClick={() => navigate('/settings')}
                className="font-semibold underline underline-offset-2"
              >
                Open Settings
              </button>
            </p>
          </div>
        )}

        <div className="relative flex-1">
          <RouteMap
            waypoints={waypoints}
            route={route}
            onAddWaypoint={addWaypoint}
            onMoveWaypoint={moveWaypoint}
            onRemoveWaypoint={removeWaypoint}
          />
          {!route && (
            <div className="pointer-events-none absolute left-1/2 top-4 z-[400] -translate-x-1/2 rounded-full bg-card/95 px-4 py-1.5 text-xs font-medium shadow-md">
              <span className="flex items-center gap-1.5">
                <MousePointerClick className="h-3.5 w-3.5" />
                Click the map to place waypoints, then press Generate
              </span>
            </div>
          )}
        </div>

        {generationError && (
          <div className="shrink-0 border-t bg-destructive/5 px-4 py-2 text-xs text-destructive">
            {generationError}
          </div>
        )}

        {route && (
          <div className="shrink-0 border-t bg-card">
            <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 text-sm">
              <Stat label="Distance" value={`${route.totalDistanceKm} km`} />
              <Stat label="Ascent" value={`${route.totalAscentM} m`} />
              <Stat label="Time" value={formatDuration(route.totalTimeMins)} />
              <Stat label="Days" value={String(route.stages.length)} />
              {route.isMock && <Badge variant="warning">Demo route</Badge>}
              {warnings.length > 0 && (
                <Badge variant="warning">{warnings.length} warning(s)</Badge>
              )}
            </div>

            {warnings.length > 0 && (
              <ul className="space-y-0.5 px-4 pb-2 text-xs text-amber-700 dark:text-amber-300">
                {warnings.map((w, i) => (
                  <li key={i}>• {w.message}</li>
                ))}
              </ul>
            )}

            <div className="border-t px-2 pb-2 pt-1">
              <ElevationProfile profile={route.elevationProfile} height={140} />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  )
}
