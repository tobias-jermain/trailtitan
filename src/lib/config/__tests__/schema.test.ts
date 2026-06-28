import { describe, expect, it } from 'vitest'
import { ExpeditionConfigSchema } from '../schema'
import { defaultConfig } from '../defaults'
import { applyPreset, builtInPresets, findPreset } from '../presets'

describe('ExpeditionConfigSchema', () => {
  it('accepts the default config', () => {
    expect(ExpeditionConfigSchema.safeParse(defaultConfig).success).toBe(true)
  })

  it('rejects a group max below the min', () => {
    const result = ExpeditionConfigSchema.safeParse({
      ...defaultConfig,
      groupSize: { min: 5, max: 2 },
    })
    expect(result.success).toBe(false)
  })

  it('rejects day mode with more than one day', () => {
    const result = ExpeditionConfigSchema.safeParse({
      ...defaultConfig,
      expeditionMode: 'day',
      daysCount: 3,
    })
    expect(result.success).toBe(false)
  })

  it('rejects wild camping without camping', () => {
    const result = ExpeditionConfigSchema.safeParse({
      ...defaultConfig,
      campingAllowed: false,
      wildcampingAllowed: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects an out-of-range daysCount', () => {
    const result = ExpeditionConfigSchema.safeParse({
      ...defaultConfig,
      expeditionMode: 'multi-day',
      daysCount: 99,
    })
    expect(result.success).toBe(false)
  })
})

describe('presets', () => {
  it('every built-in preset produces a valid config', () => {
    for (const preset of builtInPresets) {
      const config = applyPreset(preset.config)
      expect(
        ExpeditionConfigSchema.safeParse(config),
        `preset ${preset.id} should be valid`,
      ).toMatchObject({ success: true })
    }
  })

  it('applyPreset merges nested objects over defaults', () => {
    const config = applyPreset({ groupSize: { min: 2, max: 2 } })
    expect(config.groupSize).toEqual({ min: 2, max: 2 })
    // Untouched nested defaults survive.
    expect(config.surfaceWeights).toEqual(defaultConfig.surfaceWeights)
  })

  it('findPreset returns a known preset and undefined otherwise', () => {
    expect(findPreset('day-walk')?.name).toBe('Day Walk')
    expect(findPreset('nope')).toBeUndefined()
  })
})
