import { useNavigate } from 'react-router-dom'
import { useExpeditionStore } from '@/lib/store/expedition'
import { RouteMap } from '@/components/map/RouteMap'
import { ElevationProfile } from '@/components/map/ElevationProfile'
import { RouteReport } from '@/components/export/RouteReport'
import { Button } from '@/components/ui/button'

/** Read-only view of the currently generated route. */
export function RouteView() {
  const navigate = useNavigate()
  const route = useExpeditionStore((s) => s.route)

  if (!route) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-muted-foreground">No route to display.</p>
        <Button onClick={() => navigate('/planner')}>Go to planner</Button>
      </div>
    )
  }

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col">
        <div className="flex-1">
          <RouteMap waypoints={[]} route={route} interactive={false} />
        </div>
        <div className="shrink-0 border-t bg-card p-2">
          <ElevationProfile profile={route.elevationProfile} height={140} />
        </div>
      </div>
      <div className="overflow-y-auto border-l p-6">
        <RouteReport route={route} />
      </div>
    </div>
  )
}
