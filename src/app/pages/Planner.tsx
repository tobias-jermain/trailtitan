import { useNavigate } from 'react-router-dom'
import { ArrowRight, MousePointerClick } from 'lucide-react'
import { useExpeditionStore } from '@/lib/store/expedition'
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
  const addWaypoint = useExpeditionStore((s) => s.addWaypoint)
  const moveWaypoint = useExpeditionStore((s) => s.moveWaypoint)
  const removeWaypoint = useExpeditionStore((s) => s.removeWaypoint)

  const warnings = validation.filter((v) => v.severity === 'warning')

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[380px_1fr]">
      {/* Wizard */}
      <aside className="hidden border-r bg-card lg:block">
        <WizardSidebar />
      </aside>

      {/* Map + results */}
      <section className="flex h-full flex-col overflow-hidden">
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
                Click the map to place waypoints
              </span>
            </div>
          )}
        </div>

        {route && (
          <div className="shrink-0 border-t bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Stat label="Distance" value={`${route.totalDistanceKm} km`} />
                <Stat label="Ascent" value={`${route.totalAscentM} m`} />
                <Stat label="Time" value={formatDuration(route.totalTimeMins)} />
                <Stat label="Days" value={String(route.stages.length)} />
                {route.isMock && <Badge variant="warning">Demo route</Badge>}
                {warnings.length > 0 && (
                  <Badge variant="warning">{warnings.length} warning(s)</Badge>
                )}
              </div>
              <Button size="sm" onClick={() => navigate('/export')}>
                Review & export <ArrowRight className="h-4 w-4" />
              </Button>
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
