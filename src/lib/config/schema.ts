import { z } from 'zod'

/**
 * The ExpeditionConfig schema is the single source of truth for all tuneable
 * behaviour in TrailTitan. The planner wizard renders its controls from these
 * fields and validation runs `ExpeditionConfigSchema.safeParse(config)`.
 *
 * Nothing about any specific programme, award scheme, or organisation is
 * encoded here — every limit is a plain, user-editable number.
 */

export const SurfaceWeightsSchema = z.object({
  footpath: z.number().min(0).max(1),
  bridleway: z.number().min(0).max(1),
  track: z.number().min(0).max(1),
  road: z.number().min(0).max(1),
})

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:MM (24-hour)')

export const ArrivalWindowSchema = z.object({
  earliest: timeString,
  latest: timeString,
})

export const CheckpointSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Checkpoint needs a name'),
  /** [lng, lat] — GeoJSON order, matching ORS. */
  coordinates: z.tuple([z.number(), z.number()]),
  arrivalWindow: ArrivalWindowSchema.optional(),
  notes: z.string().optional(),
})

export const ResupplyPointSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Resupply point needs a name'),
  coordinates: z.tuple([z.number(), z.number()]),
  day: z.number().int().min(1),
  notes: z.string().optional(),
})

export const WeatherThresholdsSchema = z.object({
  enabled: z.boolean(),
  maxWindSpeedKph: z.number().min(0),
  maxRainfallMmPerHr: z.number().min(0),
  minVisibilityKm: z.number().min(0),
})

export const EmergencyContactSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  phone: z.string().min(1),
})

export const ExpeditionConfigSchema = z
  .object({
    expeditionMode: z.enum(['day', 'multi-day', 'basecamp']),
    daysCount: z.number().int().min(1).max(14),
    groupSize: z.object({
      min: z.number().int().min(1),
      max: z.number().int().min(1),
    }),
    pace: z.enum(['slow', 'moderate', 'fast']),
    dailyDistanceLimits: z.object({
      min: z.number().min(0),
      max: z.number().positive(),
    }),
    elevationBudgetPerDay: z.number().positive(),
    terrainPreference: z.enum(['low', 'moderate', 'challenging', 'any']),
    surfaceWeights: SurfaceWeightsSchema,
    checkpoints: z.array(CheckpointSchema),
    campingAllowed: z.boolean(),
    wildcampingAllowed: z.boolean(),
    resupplyPoints: z.array(ResupplyPointSchema),
    weatherThresholds: WeatherThresholdsSchema,
    reportExport: z.enum(['none', 'gpx', 'pdf', 'csv', 'all']),
    emergencyContacts: z.array(EmergencyContactSchema),
  })
  .superRefine((config, ctx) => {
    if (config.groupSize.max < config.groupSize.min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['groupSize', 'max'],
        message: 'Maximum group size cannot be less than the minimum',
      })
    }
    if (config.dailyDistanceLimits.max < config.dailyDistanceLimits.min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dailyDistanceLimits', 'max'],
        message: 'Maximum daily distance cannot be less than the minimum',
      })
    }
    if (config.expeditionMode === 'day' && config.daysCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['daysCount'],
        message: 'Day mode must have exactly one day',
      })
    }
    if (config.wildcampingAllowed && !config.campingAllowed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wildcampingAllowed'],
        message: 'Wild camping requires camping to be allowed',
      })
    }
  })

export type ExpeditionConfig = z.infer<typeof ExpeditionConfigSchema>
export type SurfaceWeights = z.infer<typeof SurfaceWeightsSchema>
export type Checkpoint = z.infer<typeof CheckpointSchema>
export type ResupplyPoint = z.infer<typeof ResupplyPointSchema>
export type WeatherThresholds = z.infer<typeof WeatherThresholdsSchema>
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>
export type Pace = ExpeditionConfig['pace']
export type ExpeditionMode = ExpeditionConfig['expeditionMode']
export type TerrainPreference = ExpeditionConfig['terrainPreference']
