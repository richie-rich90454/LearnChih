import { useEffect, useState } from "react";

/**
 * Stale-while-revalidate indicator (B78).
 *
 * Returns whether a TanStack Query result is currently "stale" (older than
 * `staleTime` since `dataUpdatedAt`). Consumers can show a subtle "data may be
 * outdated" badge while background refetches run, giving users confidence the
 * UI is still working even when the network is slow.
 *
 * CONVENTION (B78): Pages that display cached data with a background refetch
 * should call this hook with the query's `dataUpdatedAt` and `staleTime`, then
 * surface a non-blocking indicator (e.g. a muted badge) when `isStale` is true.
 * The hook polls on an interval so the indicator flips to stale in real time
 * without requiring a re-render from the query itself.
 *
 * Usage:
 *   const query = useMyData();
 *   const isStale = useStaleIndicator(query.dataUpdatedAt, query.staleTime);
 *
 * @param dataUpdatedAt - `query.dataUpdatedAt` (ms epoch) from a TanStack Query
 *   result. When 0/undefined the data is treated as not stale.
 * @param staleTime - `query.staleTime` in ms (default 0 = always stale once
 *   settled). Mirrors TanStack Query's own `staleTime` option.
 * @param pollMs - how often to re-evaluate staleness (default 30s).
 */
export function useStaleIndicator(
    dataUpdatedAt: number | undefined,
    staleTime: number = 0,
    pollMs: number = 30_000,
): boolean {
    const [isStale, setIsStale] = useState<boolean>(() =>
        computeStale(dataUpdatedAt, staleTime),
    );

    useEffect(() => {
        setIsStale(computeStale(dataUpdatedAt, staleTime));
        if (!dataUpdatedAt) return;

        const interval = window.setInterval(() => {
            setIsStale(computeStale(dataUpdatedAt, staleTime));
        }, pollMs);
        return () => window.clearInterval(interval);
    }, [dataUpdatedAt, staleTime, pollMs]);

    return isStale;
}

function computeStale(
    dataUpdatedAt: number | undefined,
    staleTime: number,
): boolean {
    if (!dataUpdatedAt) return false;
    if (staleTime === Infinity) return false;
    return Date.now() - dataUpdatedAt > staleTime;
}

export default useStaleIndicator;
