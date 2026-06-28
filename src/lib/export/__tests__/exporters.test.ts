import { describe, expect, it } from 'vitest'
import { buildGpx } from '../gpx'
import { buildCsv } from '../csv'
import { buildRoute } from '@/lib/routing/route-core'
import { buildMockGeometry } from '@/lib/routing/mock-route'
import { applyPreset } from '@/lib/config/presets'
import type { GeneratedRoute } from '@/types/expedition'

function fixtureRoute(days = 2): GeneratedRoute {
  const config = applyPreset({
    expeditionMode: 'multi-day',
    daysCount: days,
    checkpoints: [
      {
        id: 'cp1',
        name: 'Summit & "rest" <stop>',
        coordinates: [-4.05, 53.07],
      },
    ],
  })
  const { geometry, elevations } = buildMockGeometry([], config)
  return buildRoute({ name: 'Fixture', geometry, elevations, config, isMock: true })
}

describe('buildGpx', () => {
  it('produces a GPX 1.1 document with one trkseg per day', () => {
    const gpx = buildGpx(fixtureRoute(3))
    expect(gpx).toContain('<?xml version="1.0"')
    expect(gpx).toContain('<gpx version="1.1"')
    expect((gpx.match(/<trkseg>/g) ?? []).length).toBe(3)
  })

  it('escapes XML special characters in names', () => {
    const gpx = buildGpx(fixtureRoute())
    expect(gpx).toContain('Summit &amp; &quot;rest&quot; &lt;stop&gt;')
    expect(gpx).not.toContain('"rest" <stop>')
  })

  it('includes a wpt for each checkpoint', () => {
    const gpx = buildGpx(fixtureRoute())
    expect((gpx.match(/<wpt /g) ?? []).length).toBe(1)
  })
})

describe('buildCsv', () => {
  it('emits a header row and one row per stage', () => {
    const csv = buildCsv(fixtureRoute(4))
    const lines = csv.trim().split('\n')
    expect(lines[0]).toContain('Day')
    expect(lines[0]).toContain('Est. Time (mins)')
    expect(lines).toHaveLength(5) // header + 4 stages
  })
})
