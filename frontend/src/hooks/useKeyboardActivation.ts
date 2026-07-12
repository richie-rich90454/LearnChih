import { useCallback } from "react";

/**
 * Enter/Space activation for custom interactive elements (B100).
 *
 * Native `<button>` elements activate on both Enter and Space out of the box.
 * When a custom element (e.g. a `<div role="button">` or a styled `<span>`)
 * is used as a clickable surface, it must replicate that behavior: Enter
 * triggers activation, and Space triggers activation (with default prevented
 * so the page doesn't scroll). Without this, keyboard users cannot activate
 * custom controls.
 *
 * CONVENTION (B100): Any non-`<button>` element that has an `onClick` handler
 * and `role="button"` (or is otherwise interactive) must also spread the props
 * from this hook so Enter and Space are handled. The hook returns a stable
 * `onKeyDown` handler.
 *
 * Usage:
 *   const handleKeyDown = useKeyboardActivation(onActivate);
 *   <div role="button" tabIndex={0} onClick={onActivate} onKeyDown={handleKeyDown}>
 *     ...
 *   </div>
 *
 * @param onActivate - called when Enter or Space is pressed
 */
export function useKeyboardActivation(
    onActivate: () => void,
): (e: React.KeyboardEvent<HTMLElement>) => void {
    return useCallback(
        (e: React.KeyboardEvent<HTMLElement>) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                e.stopPropagation();
                onActivate();
            }
        },
        [onActivate],
    );
}

export default useKeyboardActivation;
