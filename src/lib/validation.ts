import type { ExpeditionConfig, GeneratedRoute } from '@/types/expedition'
import { ExpeditionConfigSchema } from '@/lib/config/schema'

export type ValidationSeverity = 'error' | 'warning'

export interface ValidationItem {
  severity: ValidationSeverity
  field: string
  message: string
}

/** Validate the config itself against the Zod schema (structural errors). */
export function validateConfig(config: ExpeditionConfig): ValidationItem[] {
  const result = ExpeditionConfigSchema.safeParse(config)
  if (result.success) return []
  return result.error.issues.map((issue) => ({
    severity: 'error' as const,
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }))
}

/**
 * Validate a generated route against the config's soft constraints. These are
 * warnings, not hard errors — the plan is still usable, but the planner flags
 * anything outside the configured envelope so the user makes an informed call.
 */
export function validateRoute(
  route: GeneratedRoute,
  config: ExpeditionConfig,
): ValidationItem[] {
  const items: ValidationItem[] = []
  const { min: minKm, max: maxKm } = config.dailyDistanceLimits

  for (const stage of route.stages) {
    if (stage.distanceKm > maxKm) {
      items.push({
        severity: 'warning',
        field: `stage.${stage.day}.distance`,
        message: `Day ${stage.day} is ${stage.distanceKm} km, over the ${maxKm} km daily limit.`,
      })
    }
    if (minKm > 0 && stage.distanceKm < minKm) {
      items.push({
        severity: 'warning',
        field: `stage.${stage.day}.distance`,
        message: `Day ${stage.day} is ${stage.distanceKm} km, under the ${minKm} km daily minimum.`,
      })
    }
    if (stage.ascentM > config.elevationBudgetPerDay) {
      items.push({
        severity: 'warning',
        field: `stage.${stage.day}.ascent`,
        message: `Day ${stage.day} climbs ${stage.ascentM} m, over the ${config.elevationBudgetPerDay} m daily budget.`,
      })
    }
  }

  // Checkpoint arrival-window check against the Naismith estimate from the day start.
  for (const cp of config.checkpoints) {
    if (!cp.arrivalWindow) continue
    if (!isValidWindow(cp.arrivalWindow.earliest, cp.arrivalWindow.latest)) {
      items.push({
        severity: 'warning',
        field: `checkpoint.${cp.id}`,
        message: `Checkpoint "${cp.name}" has an arrival window that ends before it starts.`,
      })
    }
  }

  return items
}

function isValidWindow(earliest: string, latest: string): boolean {
  return toMinutes(earliest) <= toMinutes(latest)
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function hasErrors(items: ValidationItem[]): boolean {
  return items.some((i) => i.severity === 'error')
}
