import { type ComponentPropsWithoutRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import styles from "./Stack.module.css";

/** Spacing scale steps mapped 1:1 to the `--space-*` tokens. */
export type SpaceScale = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;

/** Cross-axis alignment for the stack's children. */
export type StackAlign = "start" | "center" | "end" | "stretch";

const alignMap: Record<StackAlign, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
};

type StackOwnProps<T extends ElementType> = {
    /** Polymorphic element override (defaults to `div`). */
    as?: T;
    /** Gap between stacked children, mapped to `--space-*`. Defaults to 4 (16px). */
    gap?: SpaceScale;
    /** Cross-axis alignment of children. Defaults to `stretch`. */
    align?: StackAlign;
    children?: ReactNode;
};

export type StackProps<T extends ElementType = "div"> = StackOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof StackOwnProps<T>>;

/**
 * Vertical stack. Renders a flex column with a token-based gap and optional
 * cross-axis alignment. Polymorphic via `as` (e.g. `<Stack as="section">`).
 */
export function Stack<T extends ElementType = "div">({
    as,
    gap = 4,
    align = "stretch",
    className,
    style,
    ...rest
}: StackProps<T>) {
    const Comp = (as ?? "div") as ElementType;
    return (
        <Comp
            className={[styles.stack, className].filter(Boolean).join(" ")}
            style={
                {
                    "--stack-gap": `var(--space-${gap})`,
                    "--stack-align": alignMap[align],
                    ...style,
                } as CSSProperties
            }
            {...rest}
        />
    );
}
