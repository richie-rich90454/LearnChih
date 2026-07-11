import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dismiss24Regular,
    Bookmark24Regular,
    CheckmarkCircle24Regular,
    Delete24Regular,
    SelectAllOn24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useBookmarkStore } from "../store/bookmarkStore";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import styles from "./List.module.css";

/**
 * Bookmarks page with batch selection (F75). Selection state is local to the
 * page (not persisted); the bar exposes select-all, batch delete, and clear-
 * selection actions. Each card is clickable to open the resource when not in
 * selection mode — clicking a card while in selection mode toggles its row.
 *
 * Spec ref: F75.
 */
export default function BookmarksPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const bookmarks = useBookmarkStore((s) => s.bookmarks);
    const removeBookmark = useBookmarkStore((s) => s.removeBookmark);

    const items = useMemo(
        () =>
            Object.values(bookmarks).sort(
                (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
            ),
        [bookmarks],
    );

    const [selected, setSelected] = useState<Set<number>>(new Set());

    const toggleSelected = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAll = () => setSelected(new Set(items.map((i) => i.resourceId)));
    const clearSelection = () => setSelected(new Set());

    const batchDelete = () => {
        for (const id of selected) {
            removeBookmark(id);
        }
        setSelected(new Set());
    };

    const selectedCount = selected.size;
    const hasItems = items.length > 0;

    return (
        <main className={`${styles.page} ${styles.pageNarrow}`}>
            <Seo
                title={`${t("bookmarks.title")} — LernChih`}
                description={t("bookmarks.description")}
                canonicalPath="/bookmarks"
            />
            <header className={styles.pageHeader}>
                <h1 className={styles.title}>{t("bookmarks.title")}</h1>
                {hasItems && (
                    <Button
                        variant="subtle"
                        size="small"
                        icon={<SelectAllOn24Regular />}
                        onClick={selectedCount === items.length ? clearSelection : selectAll}
                    >
                        {selectedCount === items.length && selectedCount > 0
                            ? t("bookmarks.clearSelection")
                            : t("bookmarks.selectAll")}
                    </Button>
                )}
            </header>
            {items.length === 0 ? (
                <EmptyState
                    icon={<Bookmark24Regular />}
                    title={t("empty.bookmarksTitle")}
                    description={t("empty.bookmarksDescription")}
                    action={
                        <Button variant="primary" onClick={() => navigate("/resources")}>
                            {t("empty.bookmarksAction")}
                        </Button>
                    }
                />
            ) : (
                <>
                    {selectedCount > 0 && (
                        <div className={styles.batchBar} role="status" aria-live="polite">
                            <div className={styles.batchBarLead}>
                                <CheckmarkCircle24Regular className={styles.headerIcon} />
                                <span>
                                    {t("bookmarks.selectedCount", { count: selectedCount })}
                                </span>
                            </div>
                            <div className={styles.batchBarActions}>
                                <Button
                                    variant="subtle"
                                    size="small"
                                    onClick={clearSelection}
                                >
                                    {t("bookmarks.clearSelection")}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="small"
                                    icon={<Delete24Regular />}
                                    onClick={batchDelete}
                                >
                                    {t("bookmarks.deleteSelected")}
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className={styles.list}>
                        {items.map((item) => {
                            const isSelected = selected.has(item.resourceId);
                            return (
                                <Card
                                    key={item.resourceId}
                                    className={`${styles.item} ${styles.itemRow} ${styles.itemClickable} ${isSelected ? styles.itemSelected : ""}`}
                                    padding="md"
                                    onClick={() => {
                                        if (selectedCount > 0) {
                                            toggleSelected(item.resourceId);
                                        } else {
                                            navigate(`/resources/${item.resourceId}`);
                                        }
                                    }}
                                >
                                    <div className={styles.batchBarLead}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelected(item.resourceId)}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-label={t("bookmarks.selectItem", {
                                                title: item.title,
                                            })}
                                            className={styles.batchSelectAll}
                                        />
                                        <div>
                                            <h3 className={styles.itemTitle}>{item.title}</h3>
                                            <Badge variant="neutral" size="small">
                                                {t("bookmarks.resource", {
                                                    id: item.resourceId,
                                                })}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Dismiss24Regular />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeBookmark(item.resourceId);
                                            setSelected((prev) => {
                                                const next = new Set(prev);
                                                next.delete(item.resourceId);
                                                return next;
                                            });
                                        }}
                                        aria-label={t("bookmarks.remove")}
                                    />
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </main>
    );
}
