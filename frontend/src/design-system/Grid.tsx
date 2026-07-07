import { type ComponentPropsWithoutRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { type SpaceScale } from "./Stack";
import styles from "./Grid.module.css";

type GridOwnProps<T extends ElementType> = {
    /** Polymorphic element override (defaults to `div`). */
    as?: T;
    /** Minimum column width (any CSS length). Defaults to `240px`. */
    minColumnWidth?: string;
    /** Gap between grid tracks, mapped to `--space-*`. Defaults to 4 (16px). */
    gap?: SpaceScale;
    children?: ReactNode;
};

export type GridProps<T extends ElementType = "div"> = GridOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof GridOwnProps<T>>;

/**
 * Responsive grid. The number of columns is derived from `minColumnWidth`:
 * the grid auto-fills as many equal columns as fit the container, each at
 * least `minColumnWidth` wide, and reflows without explicit breakpoints.
 * Polymorphic via `as`.
 */
export function Grid<T extends ElementType = "div">({
    as,
    minColumnWidth = "240px",
    gap = 4,
    className,
    style,
    ...rest
}: GridProps<T>) {
    const Comp = (as ?? "div") as ElementType;
    return (
        <Comp
            className={[styles.grid, className].filter(Boolean).join(" ")}
            style={
                {
                    "--grid-min": minColumnWidth,
                    "--grid-gap": `var(--space-${gap})`,
                    ...style,
                } as CSSProperties
            }
            {...rest}
        />
    );
}
