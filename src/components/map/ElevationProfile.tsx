import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ElevationPoint } from '@/types/expedition'

interface ElevationProfileProps {
  profile: ElevationPoint[]
  height?: number
}

/** Area chart of elevation against cumulative distance. */
export function ElevationProfile({ profile, height = 160 }: ElevationProfileProps) {
  if (profile.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No elevation data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={profile}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e7d6b" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#16306b" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="distanceKm"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(v: number) => `${v.toFixed(0)}km`}
          tick={{ fontSize: 11 }}
          stroke="currentColor"
          className="text-muted-foreground"
        />
        <YAxis
          tickFormatter={(v: number) => `${v}m`}
          tick={{ fontSize: 11 }}
          width={48}
          stroke="currentColor"
          className="text-muted-foreground"
        />
        <Tooltip
          formatter={(value: number) => [`${value} m`, 'Elevation']}
          labelFormatter={(label: number) => `${label.toFixed(1)} km`}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Area
          type="monotone"
          dataKey="elevationM"
          stroke="#16306b"
          strokeWidth={2}
          fill="url(#elevFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
