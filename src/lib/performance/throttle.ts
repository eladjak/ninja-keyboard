/**
 * Creates a throttled version of the given function that invokes immediately
 * on the leading edge and then at most once per `limit` milliseconds.
 *
 * @param fn - The function to throttle
 * @param limit - Minimum interval in milliseconds between invocations
 * @returns A throttled function with a `cancel` method
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

type ThrottledFunction<T extends AnyFunction> = ((...args: Parameters<T>) => void) & {
  cancel(): void
}

export function throttle<T extends AnyFunction>(fn: T, limit: number): ThrottledFunction<T> {
  let lastCallTime: number | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const throttled = (...args: Parameters<T>): void => {
    const now = Date.now()

    if (lastCallTime === null || now - lastCallTime >= limit) {
      // Leading edge: execute immediately
      lastCallTime = now
      fn(...args)
    } else {
      // Trailing: schedule for remaining time
      lastArgs = args
      if (timeoutId === null) {
        const remaining = limit - (now - lastCallTime)
        timeoutId = setTimeout(() => {
          lastCallTime = Date.now()
          timeoutId = null
          if (lastArgs !== null) {
            fn(...lastArgs)
            lastArgs = null
          }
        }, remaining)
      }
    }
  }

  throttled.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastCallTime = null
    lastArgs = null
  }

  return throttled as ThrottledFunction<T>
}
