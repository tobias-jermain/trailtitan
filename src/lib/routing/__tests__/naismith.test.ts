import { describe, expect, it } from 'vitest'
import { effectiveSpeedKph, formatDuration, naismithTime } from '../naismith'

describe('naismithTime', () => {
  it('computes flat walking time at moderate pace', () => {
    // 10 km flat at 5 km/h = 120 minutes.
    expect(naismithTime(10, 0, 'moderate')).toBe(120)
  })

  it('adds 1 minute per 10 m of ascent', () => {
    // 0 km, 300 m ascent = 30 minutes.
    expect(naismithTime(0, 300, 'moderate')).toBe(30)
  })

  it('scales the walking component by pace', () => {
    expect(naismithTime(10, 0, 'slow')).toBe(180)
    expect(naismithTime(10, 0, 'fast')).toBe(90)
  })

  it('ignores negative ascent', () => {
    expect(naismithTime(10, -500, 'moderate')).toBe(120)
  })
})

describe('effectiveSpeedKph', () => {
  it('returns the documented flat speeds', () => {
    expect(effectiveSpeedKph('moderate')).toBeCloseTo(5)
    expect(effectiveSpeedKph('slow')).toBeCloseTo(3.33, 1)
    expect(effectiveSpeedKph('fast')).toBeCloseTo(6.67, 1)
  })
})

describe('formatDuration', () => {
  it('formats minutes under an hour', () => {
    expect(formatDuration(45)).toBe('45m')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(125)).toBe('2h 05m')
  })
})
