import { useNavigate } from 'react-router-dom'
import { ArrowRight, Mountain, Route as RouteIcon } from 'lucide-react'
import { useExpeditionStore } from '@/lib/store/expedition'
import { useAppStore } from '@/lib/store/app'
import { builtInPresets } from '@/lib/config/presets'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Home() {
  const navigate = useNavigate()
  const loadPreset = useExpeditionStore((s) => s.loadPreset)
  const savedRoutes = useAppStore((s) => s.config.savedRoutes)

  const start = (presetId: string) => {
    loadPreset(presetId)
    navigate('/planner')
  }

  return (
    <div className="h-full overflow-y-auto">
      <section className="bg-brand-gradient px-8 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold tracking-tight">
            Plan your next expedition
          </h1>
          <p className="mt-2 max-w-2xl text-white/85">
            Pick a starting preset, place waypoints on the map, and TrailTitan
            stages your route across the days with Naismith timings, elevation,
            and constraint checks. Works offline in demo mode.
          </p>
          <Button
            variant="secondary"
            className="mt-5"
            onClick={() => navigate('/planner')}
          >
            Open the planner <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-8 py-8">
        <div className="mb-4 flex items-center gap-2">
          <Mountain className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-semibold">Start from a preset</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {builtInPresets.map((preset) => (
            <Card
              key={preset.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => start(preset.id)}
            >
              <CardHeader>
                <CardTitle className="text-base">{preset.name}</CardTitle>
                <CardDescription>{preset.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                <Badge variant="outline">{preset.config.expeditionMode}</Badge>
                {preset.config.daysCount && (
                  <Badge variant="outline">{preset.config.daysCount}d</Badge>
                )}
                {preset.config.terrainPreference && (
                  <Badge variant="outline">
                    {preset.config.terrainPreference}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {savedRoutes.length > 0 && (
        <section className="mx-auto max-w-5xl px-8 pb-12">
          <div className="mb-4 flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-brand-teal" />
            <h2 className="text-lg font-semibold">Saved routes</h2>
          </div>
          <div className="space-y-2">
            {savedRoutes.map((sr) => (
              <Card key={sr.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{sr.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sr.route.totalDistanceKm} km ·{' '}
                      {sr.route.stages.length} day(s) · saved{' '}
                      {new Date(sr.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
