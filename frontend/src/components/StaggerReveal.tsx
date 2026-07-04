import { useRef, type ReactNode, type CSSProperties, useEffect } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface StaggerRevealProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    /** Stagger delay between each child in seconds. */
    stagger?: number;
    /** Vertical distance each child travels in pixels. */
    y?: number;
    /** Duration of each child's reveal in seconds. */
    duration?: number;
    childSelector?: string;
}

/**
 * Reveals child elements with a staggered fade-up animation when the
 * component mounts. Defaults to animating direct children.
 */
export function StaggerReveal({
    children,
    className,
    style,
    stagger = 0.05,
    y = 18,
    duration = 0.5,
    childSelector = "> *",
}: StaggerRevealProps) {
    const reduced = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reduced || !containerRef.current) return;

        const ctx = gsap.context(() => {
            const targets = containerRef.current?.querySelectorAll(childSelector);
            if (!targets || targets.length === 0) return;

            gsap.set(targets, { opacity: 0, y, scale: 0.98 });

            gsap.to(targets, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration,
                stagger: targets.length > 40 ? 0.02 : stagger,
                ease: "power2.out",
                force3D: true,
            });
        }, containerRef);

        return () => {
            ctx.revert();
        };
    }, [reduced, stagger, y, duration, childSelector]);

    return (
        <div ref={containerRef} className={className} style={style}>
            {children}
        </div>
    );
}
