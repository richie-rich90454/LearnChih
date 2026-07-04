import { useRef, type ReactNode, useEffect } from "react";
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
 */
export function PageTransition({ children, className }: PageTransitionProps) {
    const reduced = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reduced || !containerRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                containerRef.current,
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
        }, containerRef);

        return () => {
            ctx.revert();
        };
    }, [reduced]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ opacity: reduced ? undefined : 0 }}
        >
            {children}
        </div>
    );
}
