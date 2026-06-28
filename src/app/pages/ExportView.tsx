import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileText, Map, Save, Table } from 'lucide-react'
import { useExpeditionStore } from '@/lib/store/expedition'
import { useAppStore } from '@/lib/store/app'
import { RouteReport } from '@/components/export/RouteReport'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type ExportKind = 'gpx' | 'pdf' | 'csv'

export function ExportView() {
  const navigate = useNavigate()
  const route = useExpeditionStore((s) => s.route)
  const saveRoute = useAppStore((s) => s.saveRoute)
  const [status, setStatus] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  if (!route) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <Map className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          No route yet. Generate one in the planner first.
        </p>
        <Button onClick={() => navigate('/planner')}>Go to planner</Button>
      </div>
    )
  }

  const allowed = route.config.reportExport
  const show = (kind: ExportKind) => allowed === 'all' || allowed === kind

  const doExport = async (kind: ExportKind) => {
    setStatus(null)
    try {
      const fn =
        kind === 'gpx'
          ? window.trailtitan.exportGpx
          : kind === 'pdf'
            ? window.trailtitan.exportPdf
            : window.trailtitan.exportCsv
      const result = await fn(route)
      setStatus(
        result ? `Saved to ${result.path}` : 'Export cancelled.',
      )
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Export failed.')
    }
  }

  const onSave = async () => {
    await saveRoute(route)
    setSaved(true)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-5 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {show('gpx') && (
            <Button variant="outline" onClick={() => doExport('gpx')}>
              <Download className="h-4 w-4" /> GPX
            </Button>
          )}
          {show('pdf') && (
            <Button variant="outline" onClick={() => doExport('pdf')}>
              <FileText className="h-4 w-4" /> PDF
            </Button>
          )}
          {show('csv') && (
            <Button variant="outline" onClick={() => doExport('csv')}>
              <Table className="h-4 w-4" /> CSV
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="brand" onClick={onSave} disabled={saved}>
            <Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save route'}
          </Button>
        </div>

        {allowed === 'none' && (
          <Card>
            <CardContent className="py-4 text-sm text-muted-foreground">
              Exports are disabled for this plan (reportExport is set to
              &ldquo;none&rdquo;). Change it in the planner&apos;s Checkpoints
              step.
            </CardContent>
          </Card>
        )}

        {status && (
          <p className="rounded-md border bg-muted/40 p-3 text-sm">{status}</p>
        )}

        <RouteReport route={route} />
      </div>
    </div>
  )
}
