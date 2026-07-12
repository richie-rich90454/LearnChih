import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useReducedMotion } from "../hooks/useReducedMotion";

// Register the brand ease once at module load. Idempotent — safe under
// StrictMode double-invoke and shared with PageTransition.
gsap.registerPlugin(CustomEase);
CustomEase.create("lernchih-brand", "0.16, 1, 0.3, 1");

interface ThemeTransitionProps {
    mode: "light" | "dark";
    originX?: number;
    originY?: number;
}

// Concrete background colors that exactly match the body background declared
// in index.css. Using the same hex values (not CSS variables) guarantees the
// overlay is indistinguishable from the real app surface during the reveal.
const SURFACE = {
    light: "#FFFFFF",
    dark: "#1A1A1A",
} as const;

/**
 * Renders a circular clip-path reveal when the theme changes.
 *
 * Pattern: the overlay is painted in the *previous* theme's surface color
 * and starts fully covering the viewport. It then shrinks (clip-path circle
 * from maxRadius → 0) toward the toggle origin, revealing the new theme
 * underneath. Once the shrink completes, the overlay is unmounted.
 *
 * Disabled under reduced motion (instant color swap, no overlay rendered).
 */
export function ThemeTransition({ mode, originX, originY }: ThemeTransitionProps) {
    const reduced = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);

    // The previous mode is captured in state so the overlay can render with
    // the OLD surface color. It updates synchronously during the same render
    // pass that detects the change, so the overlay always paints the color
    // the user was just looking at (not the new one).
    const [prevMode, setPrevMode] = useState<"light" | "dark" | null>(null);
    const prevModeRef = useRef(mode);

    useEffect(() => {
        if (prevModeRef.current === mode) return;
        const oldMode = prevModeRef.current;
        prevModeRef.current = mode;
        setPrevMode(oldMode);
    }, [mode]);

    useEffect(() => {
        if (reduced || !ref.current || prevMode === null) return;

        const el = ref.current;
        const cx = originX ?? window.innerWidth / 2;
        const cy = originY ?? window.innerHeight / 2;
        const maxRadius = Math.ceil(
            Math.max(
                Math.hypot(cx, cy),
                Math.hypot(window.innerWidth - cx, cy),
                Math.hypot(cx, window.innerHeight - cy),
                Math.hypot(window.innerWidth - cx, window.innerHeight - cy),
            ),
        );

        // Start fully covering the viewport (OLD theme color on top, NEW
        // theme already swapped underneath). Shrink toward the toggle origin
        // to reveal the new theme.
        const ctx = gsap.context(() => {
            gsap.set(el, {
                clipPath: `circle(${maxRadius}px at ${cx}px ${cy}px)`,
            });

            gsap.to(el, {
                clipPath: `circle(0px at ${cx}px ${cy}px)`,
                duration: 0.48,
                ease: "lernchih-brand",
                force3D: true,
                onComplete: () => {
                    setPrevMode(null);
                },
            });
        }, el);

        return () => {
            // B7: Regression guard — the GSAP context is always reverted on
            // cleanup, and the overlay is unmounted via setPrevMode(null) in
            // the onComplete callback. This ensures the overlay never sticks
            // on the viewport if the component unmounts mid-animation.
            ctx.revert();
        };
    }, [prevMode, reduced, originX, originY]);

    if (reduced || prevMode === null) return null;
    // B43: Reduced-motion short-circuit. When the user prefers reduced motion
    // the theme swaps instantly with no overlay/clip-path animation — the
    // guard above (and the early return in the GSAP effect) ensures no motion
    // is rendered. This satisfies prefers-reduced-motion at the component
    // level in addition to the global index.css duration collapse.

    return (
        <div
            ref={ref}
            aria-hidden="true"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                pointerEvents: "none",
                backgroundColor: SURFACE[prevMode],
            }}
        />
    );
}
