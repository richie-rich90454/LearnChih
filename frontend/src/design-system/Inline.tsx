import { type ComponentPropsWithoutRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { type SpaceScale } from "./Stack";
import styles from "./Inline.module.css";

/** Cross-axis alignment for inline children. */
export type InlineAlign = "start" | "center" | "end" | "stretch" | "baseline";

/** Main-axis distribution for inline children. */
export type InlineJustify = "start" | "center" | "end" | "between" | "around" | "evenly";

const alignMap: Record<InlineAlign, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    baseline: "baseline",
};

const justifyMap: Record<InlineJustify, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
};

type InlineOwnProps<T extends ElementType> = {
    /** Polymorphic element override (defaults to `div`). */
    as?: T;
    /** Gap between items, mapped to `--space-*`. Defaults to 4 (16px). */
    gap?: SpaceScale;
    /** Cross-axis alignment. Defaults to `center`. */
    align?: InlineAlign;
    /** Main-axis distribution. Defaults to `start`. */
    justify?: InlineJustify;
    children?: ReactNode;
};

export type InlineProps<T extends ElementType = "div"> = InlineOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof InlineOwnProps<T>>;

/**
 * Horizontal inline row that wraps. Use for arranging items left-to-right
 * with consistent gaps (button rows, status strips, metadata). Polymorphic
 * via `as`.
 */
export function Inline<T extends ElementType = "div">({
    as,
    gap = 4,
    align = "center",
    justify = "start",
    className,
    style,
    ...rest
}: InlineProps<T>) {
    const Comp = (as ?? "div") as ElementType;
    return (
        <Comp
            className={[styles.inline, className].filter(Boolean).join(" ")}
            style={
                {
                    "--inline-gap": `var(--space-${gap})`,
                    "--inline-align": alignMap[align],
                    "--inline-justify": justifyMap[justify],
                    ...style,
                } as CSSProperties
            }
            {...rest}
        />
    );
}
