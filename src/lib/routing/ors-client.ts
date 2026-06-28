import type { ExpeditionConfig, GeneratedRoute, Waypoint } from '@/types/expedition'

/**
 * Thin renderer-side wrapper over the IPC bridge. The renderer never calls the
 * OpenRouteService API directly — `window.trailtitan.generateRoute` proxies the
 * request through the main process, keeping the API key out of DevTools.
 */
export async function generateRoute(
  waypoints: Waypoint[],
  config: ExpeditionConfig,
): Promise<GeneratedRoute> {
  const result = await window.trailtitan.generateRoute(waypoints, config)
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.route
}
