import { useCallback, useRef } from "react";

/**
 * Stable callback ref (B89).
 *
 * Returns a function whose identity never changes across renders, even when
 * the wrapped callback's dependencies change. This prevents child components
 * (e.g. NotificationBell, which re-renders on every notification tick) from
 * re-rendering just because a parent passed a new inline arrow function.
 *
 * Internally it stores the latest callback in a ref and exposes a stable
 * wrapper that calls through the ref. Unlike `useCallback`, you do NOT pass a
 * dependency array — the wrapper always calls the most recent fn.
 *
 * CONVENTION (B89): Use `useStableCallback` for handlers passed to memoized
 * children or context consumers that bail out on reference equality. Reserve
 * plain `useCallback` for cases where the dependency array is genuinely stable
 * and auditable. This hook is the escape hatch for "always latest, never new
 * identity" callbacks.
 *
 * Usage:
 *   const handleClick = useStableCallback((id: string) => doThing(id, extra));
 *   // handleClick identity is stable for the component's lifetime.
 */
export function useStableCallback<TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
    const ref = useRef(fn);
    ref.current = fn;

    return useCallback((...args: TArgs) => ref.current(...args), []);
}

export default useStableCallback;
