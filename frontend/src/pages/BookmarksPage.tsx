import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dismiss24Regular,
    Bookmark24Regular,
    CheckmarkCircle24Regular,
    Delete24Regular,
    SelectAllOn24Regular,
    Folder24Regular,
    MoreVertical24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useBookmarkStore } from "../store/bookmarkStore";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { BookmarkFolders } from "../components/BookmarkFolders";
import styles from "./List.module.css";

/**
 * Bookmarks page with batch selection (F75) and nested folders (F76).
 *
 * Layout: a two-column split — the BookmarkFolders tree on the left and the
 * filtered list on the right. Selecting a folder filters the list to
 * bookmarks whose folderId is that folder or any of its descendants (so a
 * parent folder shows everything nested under it). Selecting "All bookmarks"
 * (folderId === null) shows everything. The header button toggles select-all
 * across the currently-filtered list. Each row exposes a per-item "move to
 * folder" menu driven by the same store.
 *
 * Spec ref: F75, F76.
 */
export default function BookmarksPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const bookmarks = useBookmarkStore((s) => s.bookmarks);
    const folders = useBookmarkStore((s) => s.folders);
    const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
    const moveBookmark = useBookmarkStore((s) => s.moveBookmark);

    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [menuOpenForResource, setMenuOpenForResource] = useState<number | null>(null);

    // Collect descendant folder ids for the selected folder (DFS) so the
    // filter shows everything nested under it.
    const visibleFolderIds = useMemo(() => {
        if (selectedFolderId === null) return null;
        const ids = new Set<string>([selectedFolderId]);
        const stack = [selectedFolderId];
        while (stack.length) {
            const id = stack.pop()!;
            for (const f of Object.values(folders)) {
                if (f.parentId === id && !ids.has(f.id)) {
                    ids.add(f.id);
                    stack.push(f.id);
                }
            }
        }
        return ids;
    }, [selectedFolderId, folders]);

    const items = useMemo(() => {
        const sorted = Object.values(bookmarks).sort(
            (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
        );
        if (visibleFolderIds === null) return sorted;
        return sorted.filter((b) => b.folderId && visibleFolderIds.has(b.folderId));
    }, [bookmarks, visibleFolderIds]);

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

    const batchMove = (folderId: string | null) => {
        for (const id of selected) {
            moveBookmark(id, folderId);
        }
        setSelected(new Set());
    };

    const selectedCount = selected.size;
    const hasItems = items.length > 0;
    const folderList = useMemo(() => Object.values(folders), [folders]);

    return (
        <main className={styles.page}>
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
            {Object.values(bookmarks).length === 0 ? (
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
                <div className={styles.split}>
                    <aside className={styles.splitAside}>
                        <BookmarkFolders
                            selectedFolderId={selectedFolderId}
                            onSelect={setSelectedFolderId}
                        />
                    </aside>
                    <section className={styles.splitMain}>
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
                                        icon={<Folder24Regular />}
                                        onClick={() => batchMove(selectedFolderId)}
                                    >
                                        {t("bookmarks.moveToCurrent")}
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
                        {!hasItems ? (
                            <EmptyState
                                icon={<Folder24Regular />}
                                title={t("bookmarks.emptyFolderTitle")}
                                description={t("bookmarks.emptyFolderDescription")}
                            />
                        ) : (
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
                                                    <h3 className={styles.itemTitle}>
                                                        {item.title}
                                                    </h3>
                                                    {item.folderId &&
                                                    folders[item.folderId] ? (
                                                        <Badge variant="accent" size="small">
                                                            {folders[item.folderId].name}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="neutral" size="small">
                                                            {t("bookmarks.resource", {
                                                                id: item.resourceId,
                                                            })}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.batchBarActions}>
                                                <div style={{ position: "relative" }}>
                                                    <Button
                                                        variant="subtle"
                                                        size="small"
                                                        icon={<MoreVertical24Regular />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMenuOpenForResource(
                                                                menuOpenForResource ===
                                                                    item.resourceId
                                                                    ? null
                                                                    : item.resourceId,
                                                            );
                                                        }}
                                                        aria-label={t("bookmarks.moveTo", {
                                                            title: item.title,
                                                        })}
                                                    />
                                                    {menuOpenForResource === item.resourceId && (
                                                        <div
                                                            className={styles.moveMenu}
                                                            role="menu"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
                                                            <button
                                                                type="button"
                                                                className={styles.moveMenuItem}
                                                                onClick={() => {
                                                                    moveBookmark(
                                                                        item.resourceId,
                                                                        null,
                                                                    );
                                                                    setMenuOpenForResource(null);
                                                                }}
                                                            >
                                                                {t("bookmarks.moveToRoot")}
                                                            </button>
                                                            {folderList.map((f) => (
                                                                <button
                                                                    key={f.id}
                                                                    type="button"
                                                                    className={
                                                                        styles.moveMenuItem
                                                                    }
                                                                    onClick={() => {
                                                                        moveBookmark(
                                                                            item.resourceId,
                                                                            f.id,
                                                                        );
                                                                        setMenuOpenForResource(
                                                                            null,
                                                                        );
                                                                    }}
                                                                >
                                                                    {f.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
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
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}
