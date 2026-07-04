import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
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
 * Respects prefers-reduced-motion by jumping directly to the new value.
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
    const valueRef = useRef(value);
    const tweenRef = useRef<gsap.core.Tween | null>(null);
    const isFirstMountRef = useRef(true);

    useEffect(() => {
        if (!displayRef.current) return;

        const from = valueRef.current;
        const to = value;
        valueRef.current = to;

        if (reduced) {
            displayRef.current.textContent = formatter(to);
            isFirstMountRef.current = false;
            return;
        }

        if (isFirstMountRef.current && to === 0) {
            displayRef.current.textContent = formatter(to);
            isFirstMountRef.current = false;
            return;
        }

        isFirstMountRef.current = false;

        tweenRef.current?.kill();

        const obj = { value: from };
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

        return () => {
            tweenRef.current?.kill();
        };
    }, [value, duration, reduced, formatter]);

    return (
        <span className={className}>
            {prefix}
            <span ref={displayRef}>{formatter(value)}</span>
            {suffix}
        </span>
    );
}
