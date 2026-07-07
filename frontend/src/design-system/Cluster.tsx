import { type ComponentPropsWithoutRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { type SpaceScale } from "./Stack";
import styles from "./Cluster.module.css";

type ClusterOwnProps<T extends ElementType> = {
    /** Polymorphic element override (defaults to `div`). */
    as?: T;
    /** Gap between clustered items, mapped to `--space-*`. Defaults to 2 (8px). */
    gap?: SpaceScale;
    children?: ReactNode;
};

export type ClusterProps<T extends ElementType = "div"> = ClusterOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof ClusterOwnProps<T>>;

/**
 * Wrapping cluster of items. Use for tag/chip/badge groups where items
 * should flow and wrap naturally with a tight, consistent gap. Polymorphic
 * via `as`.
 */
export function Cluster<T extends ElementType = "div">({
    as,
    gap = 2,
    className,
    style,
    ...rest
}: ClusterProps<T>) {
    const Comp = (as ?? "div") as ElementType;
    return (
        <Comp
            className={[styles.cluster, className].filter(Boolean).join(" ")}
            style={
                {
                    "--cluster-gap": `var(--space-${gap})`,
                    ...style,
                } as CSSProperties
            }
            {...rest}
        />
    );
}
