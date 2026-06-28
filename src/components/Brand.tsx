import { cn } from '@/lib/utils'

/** The TrailTitan wordmark. Uses the colour logo asset from /public. */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logoColour.png"
      alt="TrailTitan"
      className={cn('h-8 w-auto select-none', className)}
      draggable={false}
    />
  )
}

/** A compact gradient "T" mark for tight spaces (window title bar, etc.). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-lg font-bold text-white',
        className,
      )}
    >
      T
    </div>
  )
}
