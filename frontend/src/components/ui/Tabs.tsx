import {
    TabList as FluentTabList,
    Tab,
    type TabListProps as FluentTabListProps,
} from "@fluentui/react-components";
import styles from "./Tabs.module.css";

/**
 * Design-system Tabs. A thin wrapper around Fluent UI v9 `TabList` that
 * applies the co-located CSS Module for the accent active indicator and
 * token-based typography. `Tab` is re-exported so callers render Fluent's
 * own Tab (preserving roving-tabindex + a11y) without needing a separate
 * import path. All native TabList props (size, appearance, onTabSelect,
 * selectedValue, vertical, …) pass through unchanged.
 */
export type TabsProps = FluentTabListProps;

function cx(...parts: Array<string | false | undefined | null>): string {
    return parts.filter(Boolean).join(" ");
}

export function Tabs({ className, ...rest }: TabsProps) {
    return <FluentTabList className={cx(styles.tabs, className)} {...rest} />;
}

export { Tab };
