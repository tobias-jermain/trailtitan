import type { GeneratedRoute } from '@/types/expedition'

/** Escape a string for inclusion in XML text/attribute content. */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Build a GPX 1.1 document from a generated route.
 *
 * - One `<trk>` with one `<trkseg>` per hiking day.
 * - `<wpt>` elements for each checkpoint and resupply point.
 * - Route metadata in `<metadata>`.
 */
export function buildGpx(route: GeneratedRoute): string {
  const lines: string[] = []
  lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  lines.push(
    '<gpx version="1.1" creator="TrailTitan" xmlns="http://www.topografix.com/GPX/1/1">',
  )

  lines.push('  <metadata>')
  lines.push(`    <name>${xmlEscape(route.name)}</name>`)
  lines.push(
    `    <desc>${xmlEscape(
      `Total ${route.totalDistanceKm} km, ${route.totalAscentM} m ascent, ${route.stages.length} day(s).`,
    )}</desc>`,
  )
  lines.push(`    <time>${route.createdAt}</time>`)
  lines.push('  </metadata>')

  // Waypoints: checkpoints then resupply points.
  for (const cp of route.config.checkpoints) {
    const [lng, lat] = cp.coordinates
    lines.push(`  <wpt lat="${lat}" lon="${lng}">`)
    lines.push(`    <name>${xmlEscape(cp.name)}</name>`)
    lines.push('    <type>checkpoint</type>')
    if (cp.notes) lines.push(`    <desc>${xmlEscape(cp.notes)}</desc>`)
    lines.push('  </wpt>')
  }
  for (const rp of route.config.resupplyPoints) {
    const [lng, lat] = rp.coordinates
    lines.push(`  <wpt lat="${lat}" lon="${lng}">`)
    lines.push(`    <name>${xmlEscape(rp.name)}</name>`)
    lines.push('    <type>resupply</type>')
    lines.push(`    <desc>Day ${rp.day}${rp.notes ? ` — ${xmlEscape(rp.notes)}` : ''}</desc>`)
    lines.push('  </wpt>')
  }

  // Track: one segment per stage/day.
  lines.push('  <trk>')
  lines.push(`    <name>${xmlEscape(route.name)}</name>`)
  for (const stage of route.stages) {
    lines.push(`    <trkseg>`)
    for (const [lng, lat] of stage.coordinates) {
      lines.push(`      <trkpt lat="${lat}" lon="${lng}"></trkpt>`)
    }
    lines.push('    </trkseg>')
  }
  lines.push('  </trk>')

  lines.push('</gpx>')
  return lines.join('\n')
}
