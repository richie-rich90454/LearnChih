import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye24Regular, EyeOff24Regular } from "@fluentui/react-icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./SpoilerBlock.module.css";

interface SpoilerBlockProps {
    /** Label shown on the summary toggle. */
    summary: string;
    /** Hidden content revealed on click. */
    children: React.ReactNode;
}

/**
 * Collapsible spoiler section (F55). Uses the native `<details>` /
 * `<summary>` elements for full keyboard and screen-reader support. When
 * collapsed the summary carries a blurred "spoiler" affordance; expanding
 * reveals the content. Honors `prefers-reduced-motion`.
 *
 * Spec ref: F55.
 */
export function SpoilerBlock({ summary, children }: SpoilerBlockProps) {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const [open, setOpen] = useState(false);

    return (
        <details
            className={styles.spoiler}
            open={open}
            onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
            style={reduced ? { transitionDuration: "0.01ms" } : undefined}
        >
            <summary className={styles.summary}>
                <span className={styles.icon}>
                    {open ? <EyeOff24Regular /> : <Eye24Regular />}
                </span>
                <span className={styles.label}>{summary}</span>
                <span className={styles.hint}>
                    {open
                        ? t("spoiler.clickToHide", "Click to hide")
                        : t("spoiler.clickToReveal", "Click to reveal")}
                </span>
            </summary>
            <div className={styles.content}>{children}</div>
        </details>
    );
}

export default SpoilerBlock;
