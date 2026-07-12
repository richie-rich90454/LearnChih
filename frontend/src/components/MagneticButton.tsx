import { useRef, type ReactNode, type MouseEvent } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useReducedMotion,
} from "motion/react";

const MAX_DISPLACEMENT = 6; // px, per spec
const SPRING_CONFIG = { stiffness: 200, damping: 15 };

interface MagneticButtonProps {
    children: ReactNode;
    /** How strongly the element follows the cursor. 0 = none, 1 = full. */
    strength?: number;
}

/**
 * Wraps a call-to-action so it drifts toward the cursor on hover, then
 * springs back to center on leave. The transform is GPU-friendly and is
 * disabled entirely under `prefers-reduced-motion`. Drift is capped at
 * 6px from center so the action never feels jumpy or unhinged.
 * B45: reduced-motion guard — handleMove early-returns and x/y are pinned to
 * 0 in the style prop so the wrapper never transforms.
 */
export function MagneticButton({ children, strength = 0.25 }: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion() ?? false;
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, SPRING_CONFIG);
    const sy = useSpring(y, SPRING_CONFIG);

    const clamp = (v: number) => Math.max(-MAX_DISPLACEMENT, Math.min(MAX_DISPLACEMENT, v));

    const handleMove = (e: MouseEvent<HTMLDivElement>) => {
        if (reduce || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        x.set(clamp(relX * strength));
        y.set(clamp(relY * strength));
    };

    const handleLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{
                display: "inline-flex",
                x: reduce ? 0 : sx,
                y: reduce ? 0 : sy,
            }}
        >
            {children}
        </motion.div>
    );
}
