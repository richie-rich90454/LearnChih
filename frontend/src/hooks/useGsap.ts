import { useRef, useEffect, type DependencyList } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./useReducedMotion";

interface GsapSetupContext {
    gsap: typeof gsap;
    tl: gsap.core.Timeline;
}

/**
 * Scoped GSAP hook that automatically:
 *  - creates a timeline
 *  - scopes animations to the returned ref
 *  - reverts the context on unmount
 *  - disables animation when the user prefers reduced motion
 *
 * @param animation callback receiving gsap and a timeline. Run animations here.
 * @param deps dependencies that should re-run the animation (defaults to []).
 *   `reduced` is always included.
 * @returns ref to attach to a container element, plus the reduced-motion flag.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
    animation?: (ctx: GsapSetupContext) => void,
    deps: DependencyList = [],
) {
    const reduced = useReducedMotion();
    const containerRef = useRef<T>(null);
    const animationRef = useRef(animation);

    // Keep the latest callback available without re-triggering the effect.
    animationRef.current = animation;

    useEffect(() => {
        if (reduced || !containerRef.current || !animationRef.current) return;

        const container = containerRef.current;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            animationRef.current?.({ gsap, tl });
        }, container);

        return () => {
            ctx.revert();
        };
    }, [reduced, ...deps]);

    return { ref: containerRef, reduced };
}
