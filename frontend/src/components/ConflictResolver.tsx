import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog as FluentDialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Textarea,
} from "@fluentui/react-components";
import { ErrorCircle24Regular } from "@fluentui/react-icons";
import { useConflictStore, type Conflict } from "@/store/conflictStore";
import { Button } from "@/components/ui/Button";
import styles from "./ConflictResolver.module.css";

export interface ConflictResolverProps {
    conflict: Conflict;
}

/**
 * Modal conflict-resolution dialog. Renders the local and server versions
 * side by side and offers three actions: "Keep mine", "Keep server", and
 * "Merge" (which reveals an editable textarea pre-filled with both versions
 * concatenated). Resolving dequeues the conflict via the conflict store,
 * which automatically surfaces the next queued conflict (if any).
 *
 * Uses the Fluent Dialog surface directly (with controlled `open`) because
 * the design-system Dialog primitive is trigger-based and accepts only
 * string content; the design-system Button primitive is used for actions.
 *
 * Spec ref: F80.
 */
export function ConflictResolver({ conflict }: ConflictResolverProps) {
    const { t } = useTranslation();
    const resolveConflict = useConflictStore((s) => s.resolveConflict);

    const [mergeMode, setMergeMode] = useState(false);
    const [mergedText, setMergedText] = useState("");

    // Reset merge state whenever a new conflict becomes active.
    useEffect(() => {
        setMergeMode(false);
        setMergedText("");
    }, [conflict.id]);

    const enterMerge = () => {
        setMergedText(
            `${conflict.localText}\n\n---\n\n${conflict.serverText}`,
        );
        setMergeMode(true);
    };

    const applyMerge = () => {
        resolveConflict(conflict.id, "merge", mergedText);
    };

    return (
        <FluentDialog open>
            <DialogSurface className={styles.body}>
                <DialogBody>
                    <DialogTitle>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
                            <ErrorCircle24Regular />
                            {t("conflictResolver.title", "Resolve conflict")}
                        </span>
                    </DialogTitle>
                    <DialogContent>
                        <p className={styles.mergeLabel} style={{ fontWeight: "var(--font-weight-regular)", color: "var(--text-secondary)" }}>
                            {t(
                                "conflictResolver.subtitle",
                                "This draft was edited both offline and on the server. Choose which version to keep.",
                            )}
                        </p>
                        <div className={styles.panels}>
                            <div className={styles.panel}>
                                <div className={styles.panelHeader}>
                                    <h3 className={styles.panelLabel}>
                                        {t("conflictResolver.yourVersion", "Your version")}
                                    </h3>
                                </div>
                                <pre className={styles.panelText}>{conflict.localText}</pre>
                            </div>
                            <div className={styles.panel}>
                                <div className={styles.panelHeader}>
                                    <h3 className={styles.panelLabel}>
                                        {t("conflictResolver.serverVersion", "Server version")}
                                    </h3>
                                </div>
                                <pre className={styles.panelText}>{conflict.serverText}</pre>
                            </div>
                        </div>

                        {mergeMode && (
                            <div className={styles.mergeSection}>
                                <label
                                    className={styles.mergeLabel}
                                    htmlFor="conflict-merge"
                                >
                                    {t("conflictResolver.mergeLabel", "Merged version (editable)")}
                                </label>
                                <Textarea
                                    id="conflict-merge"
                                    value={mergedText}
                                    onChange={(e) => setMergedText(e.target.value)}
                                    placeholder={t(
                                        "conflictResolver.mergedPlaceholder",
                                        "Edit the merged text...",
                                    )}
                                    className={styles.mergeField}
                                    resize="vertical"
                                />
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions className={styles.actions}>
                        {!mergeMode ? (
                            <>
                                <Button
                                    variant="subtle"
                                    onClick={() => resolveConflict(conflict.id, "server")}
                                >
                                    {t("conflictResolver.keepServer", "Keep server")}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => resolveConflict(conflict.id, "local")}
                                >
                                    {t("conflictResolver.keepMine", "Keep mine")}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={enterMerge}
                                >
                                    {t("conflictResolver.merge", "Merge")}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={applyMerge}
                            >
                                {t("conflictResolver.applyMerge", "Apply merge")}
                            </Button>
                        )}
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </FluentDialog>
    );
}

/**
 * Renders the next unresolved conflict in the queue, or null when the
 * queue is empty. Mounted once near the end of AppLayout so conflicts
 * surface globally without being tied to a specific route.
 *
 * Spec ref: F80.
 */
export function ConflictResolverContainer() {
    const conflict = useConflictStore((s) => s.conflicts[0]);
    if (!conflict) return null;
    return <ConflictResolver conflict={conflict} />;
}

export default ConflictResolverContainer;
