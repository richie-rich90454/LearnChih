import { Card as FluentCard, type CardProps as FluentCardProps } from "@fluentui/react-components";
import styles from "./Card.module.css";

/**
 * Design-system Card padding scale, mapped to `--space-*` tokens.
 * `md` is the default and matches a comfortable content card.
 */
export type CardPadding = "none" | "sm" | "md" | "lg";

const paddingClass: Record<CardPadding, string> = {
    none: styles.paddingNone,
    sm: styles.paddingSm,
    md: styles.paddingMd,
    lg: styles.paddingLg,
};

/**
 * Extended Card props.
 *  - `interactive`: opts into hover-lift elevation + pointer cursor + focus
 *    ring. Use for clickable cards (e.g. course tiles). Default false so
 *    static content cards do not imply interactivity.
 *  - `padding`: token-based padding scale. Defaults to `md`.
 * All native Fluent Card props pass through.
 *
 * Nesting convention (B58): A Card may be nested ONE level deep
 * (card-in-card) to group related content, but card-in-card-in-card is
 * forbidden - the triple surface border + shadow stack reads as cluttered
 * and breaks the elevation hierarchy. If you need a third container, use a
 * plain `div` with a `--border-subtle` divider instead of another Card.
 */
export interface CardProps extends FluentCardProps {
    interactive?: boolean;
    padding?: CardPadding;
}

function cx(...parts: Array<string | false | undefined | null>): string {
    return parts.filter(Boolean).join(" ");
}

export function Card({ interactive, padding = "md", className, ...rest }: CardProps) {
    const classes = cx(
        styles.card,
        interactive && styles.interactive,
        paddingClass[padding],
        className,
    );
    return <FluentCard className={classes} {...rest} />;
}
