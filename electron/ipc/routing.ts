import { ipcMain, net } from 'electron'
import type {
  ExpeditionConfig,
  GeneratedRoute,
  Waypoint,
} from '@/types/expedition'
import { buildRoute } from '@/lib/routing/route-core'
import { buildMockGeometry } from '@/lib/routing/mock-route'
import { getAppConfig } from './config'

const ORS_ENDPOINT =
  'https://api.openrouteservice.org/v2/directions/foot-hiking/geojson'

type RoutingResponse =
  | { ok: true; route: GeneratedRoute }
  | { ok: false; error: string }

export function registerRoutingHandlers(): void {
  ipcMain.handle(
    'routing:generate',
    async (
      _event,
      waypoints: Waypoint[],
      config: ExpeditionConfig,
    ): Promise<RoutingResponse> => {
      const { orsApiKey } = getAppConfig()

      // Demo / offline mode: no key → synthesise a route locally.
      if (!orsApiKey.trim()) {
        const { geometry, elevations } = buildMockGeometry(waypoints, config)
        return {
          ok: true,
          route: buildRoute({
            name: routeName(config),
            geometry,
            elevations,
            config,
            isMock: true,
          }),
        }
      }

      // Live mode requires at least two points to route between.
      if (waypoints.length < 2) {
        return {
          ok: false,
          error: 'Place at least two waypoints on the map to generate a route.',
        }
      }

      try {
        const geojson = await callOrs(orsApiKey, waypoints, config)
        const { geometry, elevations } = parseOrsGeometry(geojson)
        return {
          ok: true,
          route: buildRoute({
            name: routeName(config),
            geometry,
            elevations,
            config,
            isMock: false,
          }),
        }
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Routing request failed.',
        }
      }
    },
  )
}

function routeName(config: ExpeditionConfig): string {
  const mode =
    config.expeditionMode === 'day'
      ? 'Day route'
      : config.expeditionMode === 'basecamp'
        ? 'Basecamp route'
        : `${config.daysCount}-day route`
  return `${mode} · ${new Date().toLocaleDateString()}`
}

/** POST to ORS via Electron's net module (respects system proxy settings). */
function callOrs(
  apiKey: string,
  waypoints: Waypoint[],
  config: ExpeditionConfig,
): Promise<unknown> {
  const body = JSON.stringify({
    coordinates: waypoints.map((w) => w.coordinates),
    elevation: true,
    preference: terrainToPreference(config.terrainPreference),
    instructions: false,
  })

  return new Promise((resolve, reject) => {
    const request = net.request({
      method: 'POST',
      url: ORS_ENDPOINT,
    })
    request.setHeader('Authorization', apiKey)
    request.setHeader('Content-Type', 'application/json')
    request.setHeader('Accept', 'application/geo+json')

    let raw = ''
    request.on('response', (response) => {
      response.on('data', (chunk) => {
        raw += chunk.toString()
      })
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`ORS request failed (HTTP ${response.statusCode}).`))
          return
        }
        try {
          resolve(JSON.parse(raw))
        } catch {
          reject(new Error('Could not parse the routing response.'))
        }
      })
      response.on('error', (err: Error) => reject(err))
    })
    request.on('error', (err) => reject(err))
    request.write(body)
    request.end()
  })
}

function terrainToPreference(
  terrain: ExpeditionConfig['terrainPreference'],
): string {
  // ORS supports 'fastest' | 'shortest' | 'recommended'.
  switch (terrain) {
    case 'low':
      return 'recommended'
    case 'challenging':
      return 'shortest'
    default:
      return 'recommended'
  }
}

/** Extract [lng, lat] geometry + elevation from an ORS GeoJSON response. */
function parseOrsGeometry(geojson: unknown): {
  geometry: [number, number][]
  elevations: number[]
} {
  const feature = (geojson as any)?.features?.[0]
  const coords = feature?.geometry?.coordinates as
    | [number, number, number?][]
    | undefined
  if (!coords || coords.length === 0) {
    throw new Error('The routing response contained no geometry.')
  }
  const geometry: [number, number][] = []
  const elevations: number[] = []
  for (const c of coords) {
    geometry.push([c[0], c[1]])
    elevations.push(typeof c[2] === 'number' ? c[2] : 0)
  }
  return { geometry, elevations }
}
