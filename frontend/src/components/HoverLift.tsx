import { useRef, type ReactNode, useEffect } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface HoverLiftProps {
    children: ReactNode;
    className?: string;
    scale?: number;
    y?: number;
    shadow?: string;
}

const DEFAULT_SHADOW = "0 12px 28px rgba(0, 0, 0, 0.12)";

/**
 * Adds a subtle lift + scale micro-interaction on hover/focus.
 * Safe to wrap any interactive element (cards, buttons, list rows).
 */
export function HoverLift({
    children,
    className,
    scale = 1.015,
    y = -5,
    shadow = DEFAULT_SHADOW,
}: HoverLiftProps) {
    const reduced = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reduced || !ref.current) return;

        const el = ref.current;
        const initialShadow = getComputedStyle(el).boxShadow;

        const ctx = gsap.context(() => {
            const enter = () => {
                gsap.to(el, {
                    scale,
                    y,
                    boxShadow: shadow,
                    filter: "brightness(1.02)",
                    duration: 0.22,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            };
            const leave = () => {
                gsap.to(el, {
                    scale: 1,
                    y: 0,
                    boxShadow: initialShadow,
                    filter: "brightness(1)",
                    duration: 0.35,
                    ease: "power2.inOut",
                    overwrite: "auto",
                });
            };

            el.addEventListener("mouseenter", enter);
            el.addEventListener("mouseleave", leave);
            el.addEventListener("focusin", enter);
            el.addEventListener("focusout", leave);

            return () => {
                el.removeEventListener("mouseenter", enter);
                el.removeEventListener("mouseleave", leave);
                el.removeEventListener("focusin", enter);
                el.removeEventListener("focusout", leave);
            };
        }, el);

        return () => {
            ctx.revert();
        };
    }, [reduced, scale, y, shadow]);

    return (
        <div
            ref={ref}
            className={className}
            style={{ willChange: reduced ? undefined : "transform" }}
        >
            {children}
        </div>
    );
}
