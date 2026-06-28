import { describe, expect, it } from 'vitest'
import { buildRoute } from '../route-core'
import { buildMockGeometry } from '../mock-route'
import { applyPreset } from '@/lib/config/presets'

describe('buildRoute (via mock geometry)', () => {
  it('splits a multi-day route into one stage per day', () => {
    const config = applyPreset({ expeditionMode: 'multi-day', daysCount: 3 })
    const { geometry, elevations } = buildMockGeometry([], config)
    const route = buildRoute({
      name: 'Test',
      geometry,
      elevations,
      config,
      isMock: true,
    })
    expect(route.stages).toHaveLength(3)
    expect(route.stages.map((s) => s.day)).toEqual([1, 2, 3])
  })

  it('total distance equals the sum of stage distances (within rounding)', () => {
    const config = applyPreset({ expeditionMode: 'multi-day', daysCount: 4 })
    const { geometry, elevations } = buildMockGeometry([], config)
    const route = buildRoute({
      name: 'Test',
      geometry,
      elevations,
      config,
      isMock: true,
    })
    const stageSum = route.stages.reduce((s, st) => s + st.distanceKm, 0)
    expect(stageSum).toBeCloseTo(route.totalDistanceKm, 0)
  })

  it('produces an elevation profile parallel to geometry', () => {
    const config = applyPreset({})
    const { geometry, elevations } = buildMockGeometry([], config)
    const route = buildRoute({
      name: 'Test',
      geometry,
      elevations,
      config,
      isMock: true,
    })
    expect(route.elevationProfile).toHaveLength(geometry.length)
    expect(route.totalAscentM).toBeGreaterThan(0)
  })
})
