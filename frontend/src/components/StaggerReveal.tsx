import { useRef, type ReactNode, type CSSProperties, useLayoutEffect } from "react";
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
    y = 12,
    duration = 0.45,
    childSelector = ":scope > *",
}: StaggerRevealProps) {
    const reduced = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    // `querySelectorAll` requires a valid selector; a leading `>` combinator is
    // invalid on its own. Normalize direct-child selectors to the scoped form.
    const normalizedSelector = childSelector.startsWith(">")
        ? `:scope ${childSelector}`
        : childSelector;

    useLayoutEffect(() => {
        if (reduced || !containerRef.current) return;

        const container = containerRef.current;
        const ctx = gsap.context(() => {
            const targets = container.querySelectorAll(normalizedSelector);
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
        }, container);

        return () => {
            ctx.revert();
        };
    }, [reduced, stagger, y, duration, normalizedSelector]);

    return (
        <div ref={containerRef} className={className} style={style}>
            {children}
        </div>
    );
}
