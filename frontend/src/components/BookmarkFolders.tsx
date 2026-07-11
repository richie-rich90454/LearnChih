/**
 * BookmarkFolders - sidebar tree for nested bookmark folders (F76).
 *
 * Renders a recursive tree of folders with create / rename / delete actions
 * and "move to" actions on selected bookmarks. Backed by the persisted
 * bookmarkStore. Respects design-system tokens; no !important; reduced-
 * motion honored by global index.css guard.
 *
 * Spec ref: F76.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Folder24Regular,
    FolderOpen24Regular,
    Add24Regular,
    Delete24Regular,
    Edit24Regular,
} from "@fluentui/react-icons";
import { useBookmarkStore, type BookmarkFolder } from "../store/bookmarkStore";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import styles from "./BookmarkFolders.module.css";

interface BookmarkFoldersProps {
    selectedFolderId: string | null;
    onSelect: (folderId: string | null) => void;
}

interface TreeNodeProps {
    folder: BookmarkFolder;
    depth: number;
    selectedFolderId: string | null;
    onSelect: (folderId: string | null) => void;
}

function TreeNode({ folder, depth, selectedFolderId, onSelect }: TreeNodeProps) {
    const { t } = useTranslation();
    const [editing, setEditing] = useState(false);
    const [draftName, setDraftName] = useState(folder.name);
    const [expanded, setExpanded] = useState(true);
    const [addingChild, setAddingChild] = useState(false);
    const [childName, setChildName] = useState("");

    const folders = useBookmarkStore((s) => s.folders);
    const renameFolder = useBookmarkStore((s) => s.renameFolder);
    const deleteFolder = useBookmarkStore((s) => s.deleteFolder);
    const createFolder = useBookmarkStore((s) => s.createFolder);

    const children = Object.values(folders).filter((f) => f.parentId === folder.id);
    const selected = selectedFolderId === folder.id;

    const commitRename = () => {
        const trimmed = draftName.trim();
        if (trimmed) renameFolder(folder.id, trimmed);
        setEditing(false);
    };

    const commitAddChild = () => {
        const trimmed = childName.trim();
        if (trimmed) {
            createFolder(trimmed, folder.id);
            setChildName("");
            setAddingChild(false);
            setExpanded(true);
        }
    };

    return (
        <li
            className={styles.node}
            style={{ "--depth": depth } as React.CSSProperties}
            role="treeitem"
            aria-expanded={expanded}
            aria-selected={selected}
        >
            <div className={`${styles.row} ${selected ? styles.rowSelected : ""}`}>
                {children.length > 0 ? (
                    <button
                        type="button"
                        className={styles.expandBtn}
                        onClick={() => setExpanded((v) => !v)}
                        aria-label={
                            expanded
                                ? t("bookmarkFolders.collapse", { name: folder.name })
                                : t("bookmarkFolders.expand", { name: folder.name })
                        }
                    >
                        {expanded ? <FolderOpen24Regular /> : <Folder24Regular />}
                    </button>
                ) : (
                    <span className={styles.expandBtn} aria-hidden="true">
                        <Folder24Regular />
                    </span>
                )}
                {editing ? (
                    <Input
                        value={draftName}
                        onChange={(_, data) => setDraftName(data.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setEditing(false);
                        }}
                        size="small"
                        aria-label={t("bookmarkFolders.renameLabel")}
                    />
                ) : (
                    <button
                        type="button"
                        className={styles.label}
                        onClick={() => onSelect(folder.id)}
                    >
                        {folder.name}
                    </button>
                )}
                <div className={styles.rowActions}>
                    <Button
                        variant="subtle"
                        size="small"
                        icon={<Add24Regular />}
                        onClick={() => setAddingChild((v) => !v)}
                        aria-label={t("bookmarkFolders.addChild", { name: folder.name })}
                    />
                    <Button
                        variant="subtle"
                        size="small"
                        icon={<Edit24Regular />}
                        onClick={() => {
                            setDraftName(folder.name);
                            setEditing(true);
                        }}
                        aria-label={t("bookmarkFolders.rename", { name: folder.name })}
                    />
                    <Button
                        variant="subtle"
                        size="small"
                        icon={<Delete24Regular />}
                        onClick={() => deleteFolder(folder.id)}
                        aria-label={t("bookmarkFolders.delete", { name: folder.name })}
                    />
                </div>
            </div>
            {addingChild && (
                <div className={styles.addChildRow}>
                    <Input
                        value={childName}
                        onChange={(_, data) => setChildName(data.value)}
                        placeholder={t("bookmarkFolders.childPlaceholder")}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") commitAddChild();
                            if (e.key === "Escape") setAddingChild(false);
                        }}
                        size="small"
                    />
                    <Button variant="primary" size="small" onClick={commitAddChild}>
                        {t("common.create")}
                    </Button>
                </div>
            )}
            {expanded && children.length > 0 && (
                <ul className={styles.children} role="group">
                    {children.map((child) => (
                        <TreeNode
                            key={child.id}
                            folder={child}
                            depth={depth + 1}
                            selectedFolderId={selectedFolderId}
                            onSelect={onSelect}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

export function BookmarkFolders({ selectedFolderId, onSelect }: BookmarkFoldersProps) {
    const { t } = useTranslation();
    const folders = useBookmarkStore((s) => s.folders);
    const createFolder = useBookmarkStore((s) => s.createFolder);
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState("");

    const topLevel = Object.values(folders).filter((f) => !f.parentId);

    const commitAdd = () => {
        const trimmed = newName.trim();
        if (trimmed) {
            createFolder(trimmed, null);
            setNewName("");
            setAdding(false);
        }
    };

    return (
        <nav className={styles.root} aria-label={t("bookmarkFolders.navLabel")}>
            <div className={styles.header}>
                <h2 className={styles.heading}>{t("bookmarkFolders.heading")}</h2>
                <Button
                    variant="subtle"
                    size="small"
                    icon={<Add24Regular />}
                    onClick={() => setAdding((v) => !v)}
                    aria-label={t("bookmarkFolders.addRoot")}
                >
                    {t("bookmarkFolders.add")}
                </Button>
            </div>
            {adding && (
                <div className={styles.addChildRow}>
                    <Input
                        value={newName}
                        onChange={(_, data) => setNewName(data.value)}
                        placeholder={t("bookmarkFolders.childPlaceholder")}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") commitAdd();
                            if (e.key === "Escape") setAdding(false);
                        }}
                        size="small"
                    />
                    <Button variant="primary" size="small" onClick={commitAdd}>
                        {t("common.create")}
                    </Button>
                </div>
            )}
            <button
                type="button"
                className={`${styles.row} ${selectedFolderId === null ? styles.rowSelected : ""}`}
                onClick={() => onSelect(null)}
            >
                <span className={styles.expandBtn} aria-hidden="true">
                    <Folder24Regular />
                </span>
                <span className={styles.label}>{t("bookmarkFolders.allBookmarks")}</span>
            </button>
            {topLevel.length === 0 ? (
                <p className={styles.emptyHint}>{t("bookmarkFolders.emptyHint")}</p>
            ) : (
                <ul className={styles.tree} role="tree">
                    {topLevel.map((folder) => (
                        <TreeNode
                            key={folder.id}
                            folder={folder}
                            depth={0}
                            selectedFolderId={selectedFolderId}
                            onSelect={onSelect}
                        />
                    ))}
                </ul>
            )}
        </nav>
    );
}

export default BookmarkFolders;
