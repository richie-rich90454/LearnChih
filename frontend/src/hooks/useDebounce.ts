import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after `delayMs`
 * has elapsed without further changes. Useful for breaking up long tasks
 * triggered by fast-changing inputs (e.g. search boxes firing API calls).
 *
 * Spec refs: E56–E65.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export default useDebounce
