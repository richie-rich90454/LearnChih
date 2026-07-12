import { useCallback, useRef, useState } from "react";

/**
 * Generic undo/redo history hook. Maintains a bounded history stack split
 * into `past`, `present`, and `future` slices. Each call to `set` pushes
 * the previous present onto `past` and clears `future`. History is capped
 * at `maxHistory` entries (default 50) to bound memory.
 *
 * `reset` replaces the entire history with a single fresh present (used when
 * switching contexts, e.g. loading a different note).
 *
 * Spec ref: F69.
 */
const MAX_HISTORY = 50;

export interface UndoRedoState<T> {
    present: T;
    set: (value: T) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    reset: (value: T) => void;
}

export function useUndoRedo<T>(initial: T, maxHistory: number = MAX_HISTORY): UndoRedoState<T> {
    const [past, setPast] = useState<T[]>([]);
    const [present, setPresent] = useState<T>(initial);
    const [future, setFuture] = useState<T[]>([]);
    // Track the latest present in a ref so `set` can read it inside a stable
    // callback without depending on `present` (which would recreate the
    // callback on every keystroke).
    const presentRef = useRef(present);
    presentRef.current = present;

    const set = useCallback(
        (value: T) => {
            // Skip no-op sets so identical values do not pollute history.
            if (Object.is(value, presentRef.current)) return;
            setPast((prev) => {
                const next = [...prev, presentRef.current];
                if (next.length > maxHistory) next.shift();
                return next;
            });
            setFuture([]);
            presentRef.current = value;
            setPresent(value);
        },
        [maxHistory],
    );

    const undo = useCallback(() => {
        setPast((prevPast) => {
            if (prevPast.length === 0) return prevPast;
            const previous = prevPast[prevPast.length - 1];
            setFuture((prevFuture) => [presentRef.current, ...prevFuture]);
            presentRef.current = previous;
            setPresent(previous);
            return prevPast.slice(0, -1);
        });
    }, []);

    const redo = useCallback(() => {
        setFuture((prevFuture) => {
            if (prevFuture.length === 0) return prevFuture;
            const next = prevFuture[0];
            setPast((prevPast) => {
                const arr = [...prevPast, presentRef.current];
                if (arr.length > maxHistory) arr.shift();
                return arr;
            });
            presentRef.current = next;
            setPresent(next);
            return prevFuture.slice(1);
        });
    }, []);

    const reset = useCallback((value: T) => {
        setPast([]);
        setFuture([]);
        presentRef.current = value;
        setPresent(value);
    }, []);

    return {
        present,
        set,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        reset,
    };
}

export default useUndoRedo;
