/**
 * Creates a memoized version of the given function that caches results
 * based on arguments. Supports custom key resolver and max cache size.
 *
 * @param fn - The function to memoize
 * @param options - Optional configuration
 * @returns A memoized function with a `clearCache` method and `cacheSize` getter
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

type MemoizedFunction<T extends AnyFunction> = T & {
  clearCache(): void
  readonly cacheSize: number
}

interface MemoizeOptions<T extends AnyFunction> {
  keyResolver?: (...args: Parameters<T>) => string
  maxCacheSize?: number
}

const DEFAULT_MAX_CACHE_SIZE = 100

export function memoize<T extends AnyFunction>(
  fn: T,
  options: MemoizeOptions<T> = {},
): MemoizedFunction<T> {
  const { keyResolver, maxCacheSize = DEFAULT_MAX_CACHE_SIZE } = options
  const cache = new Map<string, ReturnType<T>>()
  const keyOrder: string[] = []

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = keyResolver ? keyResolver(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>
    }

    const result = fn(...args) as ReturnType<T>

    // Evict oldest entry if cache is full
    if (cache.size >= maxCacheSize) {
      const oldestKey = keyOrder.shift()
      if (oldestKey !== undefined) {
        cache.delete(oldestKey)
      }
    }

    cache.set(key, result)
    keyOrder.push(key)

    return result
  }

  memoized.clearCache = (): void => {
    cache.clear()
    keyOrder.length = 0
  }

  Object.defineProperty(memoized, 'cacheSize', {
    get(): number {
      return cache.size
    },
    enumerable: true,
  })

  return memoized as MemoizedFunction<T>
}
