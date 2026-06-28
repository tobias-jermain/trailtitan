import { describe, expect, it } from 'vitest'
import { validateConfig, validateRoute, hasErrors } from '../validation'
import { buildRoute } from '@/lib/routing/route-core'
import { buildMockGeometry } from '@/lib/routing/mock-route'
import { applyPreset } from '@/lib/config/presets'
import { defaultConfig } from '@/lib/config/defaults'

describe('validateConfig', () => {
  it('returns no errors for a valid config', () => {
    expect(validateConfig(defaultConfig)).toHaveLength(0)
  })

  it('reports structural errors', () => {
    const items = validateConfig({
      ...defaultConfig,
      groupSize: { min: 9, max: 1 },
    })
    expect(hasErrors(items)).toBe(true)
  })
})

describe('validateRoute', () => {
  // Build a generously-sized route once, then validate against strict limits.
  function bigRoute() {
    const genConfig = applyPreset({
      expeditionMode: 'multi-day',
      daysCount: 3,
      dailyDistanceLimits: { min: 0, max: 40 },
      elevationBudgetPerDay: 2500,
    })
    const { geometry, elevations } = buildMockGeometry([], genConfig)
    return buildRoute({
      name: 'T',
      geometry,
      elevations,
      config: genConfig,
      isMock: true,
    })
  }

  it('warns when a stage exceeds the daily distance limit', () => {
    const route = bigRoute()
    const strict = { ...route.config, dailyDistanceLimits: { min: 0, max: 1 } }
    const items = validateRoute(route, strict)
    expect(items.some((i) => i.field.includes('distance'))).toBe(true)
    expect(items.every((i) => i.severity === 'warning')).toBe(true)
  })

  it('warns when ascent exceeds the daily budget', () => {
    const route = bigRoute()
    const strict = { ...route.config, elevationBudgetPerDay: 1 }
    const items = validateRoute(route, strict)
    expect(items.some((i) => i.field.includes('ascent'))).toBe(true)
  })
})
