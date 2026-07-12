import { useRef, type ReactNode, useLayoutEffect } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useReducedMotion } from "../hooks/useReducedMotion";

// Register the brand ease once at module load. Both create() and
// registerPlugin() are idempotent, so importing this module multiple times
// (e.g. under React StrictMode) is safe.
gsap.registerPlugin(CustomEase);
CustomEase.create("lernchih-brand", "0.16, 1, 0.3, 1");

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

/**
 * Wraps routed page content with a subtle fade + 8px translate-y enter
 * animation timed to the brand motion tokens (280ms, brand ease
 * `cubic-bezier(0.16, 1, 0.3, 1)`). Exit animation is intentionally omitted
 * to keep React Router navigation snappy; the enter animation provides the
 * motion "sugar" without blocking the UI. Disabled (instant) under
 * prefers-reduced-motion.
 *
 * The initial opacity/transform is set by GSAP (not a React inline style)
 * so that re-renders cannot reset the element back to opacity:0 after the
 * animation has completed, which previously left pages visually blank.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
    const reduced = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        // B44: Reduced-motion short-circuit. Under prefers-reduced-motion the
        // fade/translate enter animation is skipped entirely so the page
        // renders instantly with no motion. This complements the global
        // index.css duration collapse by never scheduling a GSAP tween.
        if (reduced || !containerRef.current) return;

        const container = containerRef.current;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                container,
                { opacity: 0, y: 8 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.28,
                    ease: "lernchih-brand",
                    force3D: true,
                },
            );
        }, container);

        return () => {
            ctx.revert();
        };
    }, [reduced]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}
