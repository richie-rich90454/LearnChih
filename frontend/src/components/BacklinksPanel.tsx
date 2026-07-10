import { useMemo } from "react";
import { ArrowHookDownLeft24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import type { Note } from "@/api/notes";
import { Badge } from "@/components/ui/Badge";
import styles from "./BacklinksPanel.module.css";

interface BacklinksPanelProps {
    /** Title of the currently selected note. */
    currentTitle: string;
    /** All loaded notes to search for backlink references. */
    notes: Note[];
    /** Called when the user clicks a backlinking note. */
    onSelect: (note: Note) => void;
}

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

/**
 * Lists notes whose content contains a `[[currentTitle]]` wikilink pointing to
 * the currently selected note (F10). Each result is clickable to jump to the
 * linking note.
 */
export function BacklinksPanel({
    currentTitle,
    notes,
    onSelect,
}: BacklinksPanelProps) {
    const { t } = useTranslation();

    const backlinks = useMemo(() => {
        if (!currentTitle.trim()) return [];
        const target = currentTitle.toLowerCase();
        return notes.filter((n) => {
            WIKILINK_RE.lastIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = WIKILINK_RE.exec(n.content)) !== null) {
                if (match[1].trim().toLowerCase() === target) {
                    return true;
                }
            }
            return false;
        });
    }, [currentTitle, notes]);

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <span className={styles.headerIcon}>
                    <ArrowHookDownLeft24Regular />
                </span>
                <h2 className={styles.title}>{t("notes.backlinks")}</h2>
                {backlinks.length > 0 && (
                    <Badge variant="neutral">{backlinks.length}</Badge>
                )}
            </div>
            {backlinks.length === 0 ? (
                <p className={styles.empty}>{t("notes.backlinksEmpty")}</p>
            ) : (
                <ul className={styles.list}>
                    {backlinks.map((note) => (
                        <li key={note.id}>
                            <button
                                type="button"
                                className={styles.item}
                                onClick={() => onSelect(note)}
                            >
                                <span className={styles.itemTitle}>
                                    {note.title}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
