import { useCallback, useEffect, useRef } from "react";

const hasRIC =
    typeof window !== "undefined" &&
    typeof window.requestIdleCallback === "function" &&
    typeof window.cancelIdleCallback === "function";

const requestIdle: (cb: () => void) => number = hasRIC
    ? (cb) => window.requestIdleCallback(() => cb()) as unknown as number
    : (cb) => window.setTimeout(cb, 1);

const cancelIdle: (handle: number) => void = hasRIC
    ? (handle) =>
          window.cancelIdleCallback(
              handle as unknown as Parameters<typeof window.cancelIdleCallback>[0],
          )
    : (handle) => window.clearTimeout(handle);

/**
 * Defers non-critical work to an idle period. Falls back to setTimeout
 * when requestIdleCallback is unavailable. Pending work is cancelled on
 * unmount so stale callbacks never run.
 *
 * Spec refs: E56–E65.
 */
export function useIdleCallback() {
    const handleRef = useRef<number | null>(null);

    const cancel = useCallback(() => {
        if (handleRef.current !== null) {
            cancelIdle(handleRef.current);
            handleRef.current = null;
        }
    }, []);

    const schedule = useCallback(
        (fn: () => void) => {
            cancel();
            handleRef.current = requestIdle(fn);
        },
        [cancel],
    );

    useEffect(() => () => cancel(), [cancel]);

    return schedule;
}

/**
 * Yields the main thread so the browser can process input/paint before
 * continuing. Uses scheduler.yield() when available; otherwise resolves
 * immediately. Keeps long tasks from monopolizing the main thread.
 */
export function useSchedulerYield(): () => Promise<void> {
    return useCallback(() => {
        const scheduler = typeof window !== "undefined" ? (window as any).scheduler : undefined;
        if (scheduler && typeof scheduler.yield === "function") {
            return scheduler.yield() as Promise<void>;
        }
        return Promise.resolve();
    }, []);
}

export default useIdleCallback;
