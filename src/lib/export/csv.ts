import Papa from 'papaparse'
import type { GeneratedRoute } from '@/types/expedition'

/**
 * Build a stage-by-stage CSV log. One row per hiking day.
 * Columns: Day, From, To, Distance (km), Ascent (m), Descent (m),
 * Est. Time (mins), Checkpoints.
 */
export function buildCsv(route: GeneratedRoute): string {
  const rows = route.stages.map((stage) => {
    const checkpoints = route.config.checkpoints.map((c) => c.name).join('; ')
    return {
      Day: stage.day,
      From: stage.from,
      To: stage.to,
      'Distance (km)': stage.distanceKm,
      'Ascent (m)': stage.ascentM,
      'Descent (m)': stage.descentM,
      'Est. Time (mins)': stage.estTimeMins,
      Checkpoints: checkpoints,
    }
  })

  return Papa.unparse(rows, {
    columns: [
      'Day',
      'From',
      'To',
      'Distance (km)',
      'Ascent (m)',
      'Descent (m)',
      'Est. Time (mins)',
      'Checkpoints',
    ],
  })
}
