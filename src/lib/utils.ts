import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Deterministic integer formatting with thousands separators.
 *
 * IMPORTANT: do NOT use `Number.prototype.toLocaleString()` for any value that
 * is rendered during SSR/hydration. Its output depends on the runtime's ICU
 * locale data, which differs between the Node server (often `C`/POSIX in CI)
 * and the browser (`he-IL`). That divergence produces "server rendered text
 * didn't match the client" hydration errors. This helper always produces the
 * same ASCII output on both sides (e.g. 1234567 -> "1,234,567").
 */
export function formatNumber(value: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? "-" : ""
  return (
    sign +
    Math.abs(rounded)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  )
}
