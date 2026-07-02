// Route chunk prefetch utilities.
//
// `prefetchRoute` triggers a dynamic import for a route's lazy chunk and caches
// the promise so each route is only fetched once. The browser's module cache
// then serves the chunk instantly when React.lazy resolves the same import.
//
// `usePrefetchOnHover` returns spreadable `onMouseEnter` / `onFocus` handlers
// to prefetch a route when a user shows intent by hovering or focusing a link.

const prefetched = new Map<string, Promise<unknown>>()

export function prefetchRoute(key: string, importFn: () => Promise<unknown>): Promise<unknown> {
  const cached = prefetched.get(key)
  if (cached) return cached
  const promise = importFn()
  prefetched.set(key, promise)
  // Allow a failed prefetch to be retried on the next hover/navigation.
  promise.catch(() => {
    prefetched.delete(key)
  })
  return promise
}

export function usePrefetchOnHover(key: string, importFn: () => Promise<unknown>) {
  return {
    onMouseEnter: () => prefetchRoute(key, importFn),
    onFocus: () => prefetchRoute(key, importFn),
  }
}
