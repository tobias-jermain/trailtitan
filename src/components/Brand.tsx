import { cn } from '@/lib/utils'
// Import the asset so Vite emits a base-relative, hashed URL. A hardcoded
// "/logoColour.png" breaks in the packaged app, which loads over file:// where
// a leading slash resolves to the filesystem root instead of the app folder.
import logoColour from '@/assets/logoColour.png'

/** The TrailTitan wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logoColour}
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
