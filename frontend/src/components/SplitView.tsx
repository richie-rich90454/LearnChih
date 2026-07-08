import { useState, useEffect, type ReactNode } from "react";
import { Textarea, Label } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import styles from "./SplitView.module.css";

/**
 * Notes panel: a textarea bound to localStorage keyed by resource id. Loads
 * the saved value on mount and persists on every change. Failures (private
 * mode quota) are swallowed so reading never breaks.
 */
function NotesPanel({ resourceId }: { resourceId: string }) {
    const { t } = useTranslation();
    const storageKey = `lernchih-notes-${resourceId}`;
    const [value, setValue] = useState<string>("");

    useEffect(() => {
        try {
            setValue(localStorage.getItem(storageKey) ?? "");
        } catch {
            setValue("");
        }
    }, [storageKey]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = e.target.value;
        setValue(next);
        try {
            localStorage.setItem(storageKey, next);
        } catch {
            // ignore storage errors (e.g. private mode quota)
        }
    };

    return (
        <div className={styles.notes}>
            <Label className={styles.notesLabel}>{t("resources.notes")}</Label>
            <Textarea
                className={styles.notesTextarea}
                value={value}
                onChange={handleChange}
                placeholder={t("resources.notesPlaceholder")}
                aria-label={t("resources.notes")}
                resize="vertical"
            />
        </div>
    );
}

interface SplitViewProps {
    resourceId: string;
    enabled: boolean;
    children: ReactNode;
}

/**
 * Read-along notes split view. When `enabled`, renders the resource content
 * on the left and a notes textarea on the right (50/50 on desktop, stacked
 * below 768px). Notes persist per resource in localStorage. When disabled,
 * renders children unchanged.
 *
 * Spec ref: F71.
 */
export function SplitView({ resourceId, enabled, children }: SplitViewProps) {
    if (!enabled) return <>{children}</>;
    return (
        <div className={styles.split}>
            <div className={styles.pane}>{children}</div>
            <div className={styles.pane}>
                <NotesPanel resourceId={resourceId} />
            </div>
        </div>
    );
}

export default SplitView;
