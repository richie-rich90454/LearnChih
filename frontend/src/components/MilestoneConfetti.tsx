import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface MilestoneConfettiProps {
    active?: boolean;
    particleCount?: number;
    colors?: string[];
    onComplete?: () => void;
}

/**
 * Renders a one-shot confetti burst on a fixed canvas overlay when `active`
 * becomes true. Simulates gravity, drag, and rotation for a more genuine
 * celebration feel. Disabled for reduced motion.
 */
export function MilestoneConfetti({
    active = false,
    particleCount = 20,
    colors = ["#0F6CBD", "#5C2E91", "#107C10", "#FFB900", "#00B7C3"],
    onComplete,
}: MilestoneConfettiProps) {
    const reduced = useReducedMotion();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const firedRef = useRef(false);
    const tweensRef = useRef<gsap.core.Tween[]>([]);

    useEffect(() => {
        if (!active) {
            firedRef.current = false;
            return;
        }
        if (reduced || !canvasRef.current || firedRef.current) return;
        firedRef.current = true;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        const originX = width / 2;
        const originY = height / 2;

        type Shape = "rect" | "circle" | "ribbon";

        const particles = Array.from({ length: particleCount }, () => {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 7;
            const shapes: Shape[] = ["rect", "circle", "ribbon"];
            return {
                x: originX,
                y: originY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 4,
                size: 5 + Math.random() * 7,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 18,
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                drag: 0.96 + Math.random() * 0.02,
                gravity: 0.18 + Math.random() * 0.12,
                opacity: 1,
            };
        });

        let rafId = 0;
        let completed = 0;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach((p) => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;

                if (p.shape === "circle") {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.shape === "ribbon") {
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size, p.size / 3, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const r = p.size / 3;
                    ctx.beginPath();
                    ctx.roundRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5, r);
                    ctx.fill();
                }

                ctx.restore();
            });
        };

        const activeTweens: gsap.core.Tween[] = [];

        const ctxGsap = gsap.context(() => {
            tweensRef.current.forEach((t) => t.kill());
            tweensRef.current = [];

            particles.forEach((p, i) => {
                activeTweens.push(
                    gsap.to(p, {
                        opacity: 0,
                        rotation: p.rotation + p.rotationSpeed * 18,
                        duration: 0.9 + Math.random() * 0.4,
                        ease: "power1.out",
                        delay: i * 0.008,
                        onComplete: () => {
                            completed += 1;
                            if (completed === particles.length) {
                                cancelAnimationFrame(rafId);
                                ctx.clearRect(0, 0, width, height);
                                onComplete?.();
                            }
                        },
                    }),
                );
            });

            const tick = () => {
                particles.forEach((p) => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx *= p.drag;
                    p.vy += p.gravity;
                    p.rotation += p.rotationSpeed;
                });
                draw();
                rafId = requestAnimationFrame(tick);
            };
            rafId = requestAnimationFrame(tick);
        });

        tweensRef.current = activeTweens;

        return () => {
            cancelAnimationFrame(rafId);
            tweensRef.current.forEach((t) => t.kill());
            tweensRef.current = [];
            ctxGsap.revert();
        };
    }, [active, reduced, particleCount, colors, onComplete]);

    if (reduced) return null;

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                zIndex: 9999,
            }}
        />
    );
}
