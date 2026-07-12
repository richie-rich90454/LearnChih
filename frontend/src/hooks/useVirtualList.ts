import { useCallback, useState } from "react";

/**
 * Basic list windowing / virtualization (B86).
 *
 * Renders only the visible slice of a long list (plus an overscan buffer) and
 * pads the container so the scrollbar reflects the full item count. This keeps
 * the DOM node count bounded regardless of list length, which is essential when
 * a list grows past ~100 items.
 *
 * CONVENTION (B86): Any list that can exceed 100 rendered items should use this
 * hook instead of mapping the full array. The hook assumes fixed item heights;
 * for variable-height items use a dedicated virtualizer (e.g. @tanstack/react-virtual).
 *
 * Usage:
 *   const { visibleItems, totalHeight, onScroll, startIndex } = useVirtualList({
 *     items: bigArray,
 *     itemHeight: 64,
 *     containerHeight: 600,
 *     overscan: 5,
 *   });
 */
export interface UseVirtualListArgs<T> {
    items: readonly T[];
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
}

export interface UseVirtualListResult<T> {
    visibleItems: ReadonlyArray<{ item: T; index: number }>;
    startIndex: number;
    endIndex: number;
    totalHeight: number;
    onScroll: (e: React.UIEvent<HTMLElement>) => void;
}

export function useVirtualList<T>({
    items,
    itemHeight,
    containerHeight,
    overscan = 5,
}: UseVirtualListArgs<T>): UseVirtualListResult<T> {
    const [scrollTop, setScrollTop] = useState(0);

    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(
        0,
        Math.floor(scrollTop / itemHeight) - overscan,
    );
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const endIndex = Math.min(items.length, startIndex + visibleCount);

    const visibleItems = items
        .slice(startIndex, endIndex)
        .map((item, i) => ({ item, index: startIndex + i }));

    const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    return { visibleItems, startIndex, endIndex, totalHeight, onScroll };
}

export default useVirtualList;
