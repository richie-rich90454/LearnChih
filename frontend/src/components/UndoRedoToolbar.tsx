import { useTranslation } from "react-i18next";
import { ArrowUndo24Regular, ArrowRedo24Regular } from "@fluentui/react-icons";
import { Button } from "@/components/ui/Button";
import styles from "./UndoRedoToolbar.module.css";

export interface UndoRedoToolbarProps {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

/**
 * Inline Undo / Redo toolbar with Fluent icons and disabled states. Each
 * button carries a title tooltip describing its keyboard shortcut so the
 * shortcuts are discoverable without consuming extra layout space.
 *
 * Spec ref: F69.
 */
export function UndoRedoToolbar({
    canUndo,
    canRedo,
    onUndo,
    onRedo,
}: UndoRedoToolbarProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.toolbar} role="toolbar" aria-label={t("undoRedo.historyHint", "history")}>
            <Button
                variant="subtle"
                size="small"
                icon={<ArrowUndo24Regular />}
                onClick={onUndo}
                disabled={!canUndo}
                title={t("undoRedo.undoShortcut", "Undo (Ctrl+Z)")}
                aria-label={t("undoRedo.undo", "Undo")}
            >
                {t("undoRedo.undo", "Undo")}
            </Button>
            <Button
                variant="subtle"
                size="small"
                icon={<ArrowRedo24Regular />}
                onClick={onRedo}
                disabled={!canRedo}
                title={t("undoRedo.redoShortcut", "Redo (Ctrl+Y)")}
                aria-label={t("undoRedo.redo", "Redo")}
            >
                {t("undoRedo.redo", "Redo")}
            </Button>
        </div>
    );
}

export default UndoRedoToolbar;
