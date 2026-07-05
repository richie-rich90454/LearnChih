import { useRef, type ReactNode, useLayoutEffect } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

/**
 * Wraps routed page content with a subtle fade/slide enter animation.
 * Exit animation is intentionally omitted to keep React Router navigation
 * snappy; the enter animation provides the motion "sugar" without blocking
 * the UI.
 *
 * The initial opacity is set by GSAP (not a React inline style) so that
 * re-renders cannot reset the element back to opacity:0 after the animation
 * has completed, which previously left pages visually blank.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
    const reduced = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (reduced || !containerRef.current) return;

        const container = containerRef.current;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                container,
                { opacity: 0, y: 12, scale: 0.985 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.45,
                    ease: "power3.out",
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
