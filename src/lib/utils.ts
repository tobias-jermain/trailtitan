import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind-aware className merge used across the UI kit. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
