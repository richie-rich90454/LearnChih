import { useEffect, useRef, type ReactNode } from "react";
import { makeStyles, tokens, Title1, Subtitle1 } from "@fluentui/react-components";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export interface StickyScrollCard {
    title: string;
    description: string;
    icon?: ReactNode;
}

interface StickyScrollStackProps {
    cards: StickyScrollCard[];
}

/**
 * Canonical stacked-cards scroll section. Each card is pinned in turn as it
 * reaches the top of the scroll container; the previous card scales down to
 * 0.92 and fades to 0.55 as the next card arrives. Pinned cards use
 * `pinSpacing: false` so the next card scrolls directly over the previous.
 *
 * Because the app renders inside a nested scroll container (`#main-content`),
 * ScrollTrigger is pointed at that element instead of the window.
 *
 * Under `prefers-reduced-motion` the cards render as a plain vertical stack
 * with no pinning or scaling.
 */
const useStyles = makeStyles({
    root: {
        position: "relative",
    },
    card: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXL}`,
        backgroundColor: tokens.colorNeutralBackground1,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        willChange: "transform, opacity",
        "@media (max-width: 768px)": {
            padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalL}`,
        },
    },
    pinned: {
        height: "100vh",
    },
    static: {
        minHeight: "60vh",
    },
    inner: {
        maxWidth: "720px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.spacingVerticalL,
    },
    iconWrap: {
        color: tokens.colorBrandForeground1,
        display: "inline-flex",
    },
});

export function StickyScrollStack({ cards }: StickyScrollStackProps) {
    const styles = useStyles();
    const reduce = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reduce || !containerRef.current) return;

        // The landing page scrolls inside #main-content, not the window, so
        // ScrollTrigger must track that element.
        const scroller =
            (containerRef.current.closest("#main-content") as HTMLElement | null) ??
            window;

        const ctx = gsap.context(() => {
            const els = gsap.utils.toArray<HTMLElement>(".ss-card");
            els.forEach((card, i) => {
                const isLast = i === els.length - 1;
                if (!isLast) {
                    gsap.to(card, {
                        scale: 0.92,
                        opacity: 0.55,
                        ease: "none",
                        scrollTrigger: {
                            trigger: card,
                            start: "top top",
                            end: "bottom top",
                            pin: true,
                            pinSpacing: false,
                            scrub: true,
                            scroller,
                        },
                    });
                } else {
                    // Last card: pin without scaling so it stays full while the
                    // next section scrolls up to cover it.
                    ScrollTrigger.create({
                        trigger: card,
                        start: "top top",
                        end: "bottom top",
                        pin: true,
                        pinSpacing: false,
                        scroller,
                    });
                }
            });
            ScrollTrigger.refresh();
        }, containerRef);

        return () => {
            ctx.revert();
        };
    }, [reduce, cards.length]);

    return (
        <div ref={containerRef} className={styles.root}>
            {cards.map((card, i) => (
                <div
                    key={i}
                    className={`ss-card ${styles.card} ${reduce ? styles.static : styles.pinned}`}
                >
                    <div className={styles.inner}>
                        {card.icon ? (
                            <span className={styles.iconWrap}>{card.icon}</span>
                        ) : null}
                        <Title1 as="h3">{card.title}</Title1>
                        <Subtitle1
                            style={{
                                color: tokens.colorNeutralForeground2,
                                maxWidth: "560px",
                            }}
                        >
                            {card.description}
                        </Subtitle1>
                    </div>
                </div>
            ))}
        </div>
    );
}
