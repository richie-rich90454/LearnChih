import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useInView } from "motion/react";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: ReactNode;
    suffix?: ReactNode;
    formatter?: (value: number) => string;
}

/**
 * Animates numeric value changes with a smooth count-up / count-down tween.
 * On first viewport entry, counts up from 0 to the initial value.
 * Respects prefers-reduced-motion by jumping directly to the new value.
 * B48: When reduced motion is requested the effect sets the final textContent
 * synchronously and returns before creating any GSAP tween, so the counter
 * settles instantly with no count-up animation.
 */
export function AnimatedCounter({
    value,
    duration = 0.4,
    className,
    prefix,
    suffix,
    formatter = (v) => Math.round(v).toLocaleString(),
}: AnimatedCounterProps) {
    const reduced = useReducedMotion();
    const displayRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(containerRef, { once: true, amount: 0.3 });
    const valueRef = useRef(0);
    const tweenRef = useRef<gsap.core.Tween | null>(null);
    const hasEnteredRef = useRef(false);

    useEffect(() => {
        if (!displayRef.current) return;

        const to = value;

        if (reduced) {
            displayRef.current.textContent = formatter(to);
            valueRef.current = to;
            hasEnteredRef.current = true;
            return;
        }

        // Wait for the element to enter the viewport before the first count-up.
        if (!hasEnteredRef.current && !inView) {
            return;
        }

        const from = valueRef.current;
        valueRef.current = to;
        hasEnteredRef.current = true;

        const obj = { value: from };
        const ctx = gsap.context(() => {
            tweenRef.current?.kill();
            tweenRef.current = gsap.to(obj, {
                value: to,
                duration,
                ease: "power2.out",
                overwrite: true,
                onUpdate: () => {
                    if (displayRef.current) {
                        displayRef.current.textContent = formatter(obj.value);
                    }
                },
            });
        }, displayRef.current);

        return () => {
            tweenRef.current?.kill();
            ctx.revert();
        };
    }, [value, duration, reduced, formatter, inView]);

    return (
        <span ref={containerRef} className={className}>
            {prefix}
            <span ref={displayRef}>{formatter(reduced ? value : 0)}</span>
            {suffix}
        </span>
    );
}
