import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
    Input,
    Textarea,
    Dropdown,
    Option,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Spinner,
    MessageBar,
    MessageBarBody,
    Field,
    Tooltip,
} from "@fluentui/react-components";
import { Add24Regular, Chat24Regular, Folder24Regular, FolderAdd24Regular, ChevronRight24Regular, Dismiss24Regular, Pin24Regular, PinOff24Regular, ArrowUp24Regular, ArrowDown24Regular } from "@fluentui/react-icons";
import { useChannels, useChannel, useCreateChannelThread } from "@/hooks/useChannels";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslation } from "react-i18next";
import type { Channel, ChannelThread } from "@/types";
import Seo from "@/components/Seo";
import { Pagination } from "@/components/Pagination";
import { StaggerReveal } from "@/components/StaggerReveal";
import { HoverLift } from "@/components/HoverLift";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import useAuthStore from "@/store/authStore";
import { useChannelFoldersStore } from "@/store/channelFoldersStore";
import { useChannelPinningStore } from "@/store/channelPinningStore";
import styles from "./List.module.css";
import folderStyles from "./ChannelFolders.module.css";

export default function ChannelsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const hasQueryParams = searchParams.has("q") || searchParams.has("page");
    const { data: channels, isLoading, isError, refetch } = useChannels();
    const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
    const { data: channelDetail } = useChannel(selectedChannelId);
    const createThread = useCreateChannelThread(selectedChannelId);
    const { isAuthenticated } = useAuthStore();
    const authenticated = isAuthenticated();

    const foldersMap = useChannelFoldersStore((s) => s.folders);
    const createFolder = useChannelFoldersStore((s) => s.createFolder);
    const deleteFolder = useChannelFoldersStore((s) => s.deleteFolder);
    const addChannelToFolder = useChannelFoldersStore((s) => s.addChannelToFolder);
    const removeChannelFromFolder = useChannelFoldersStore((s) => s.removeChannelFromFolder);

    const folders = useMemo(() => Object.values(foldersMap), [foldersMap]);
    const folderedChannelIds = useMemo(() => {
        const ids = new Set<number>();
        for (const f of folders) {
            for (const cid of f.channelIds) ids.add(cid);
        }
        return ids;
    }, [folders]);

    const [newFolderName, setNewFolderName] = useState("");
    const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

    const pinnedIds = useChannelPinningStore((s) => s.pinnedIds);
    const pinChannel = useChannelPinningStore((s) => s.pin);
    const unpinChannel = useChannelPinningStore((s) => s.unpin);
    const reorderPinned = useChannelPinningStore((s) => s.reorderPinned);

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        createFolder(newFolderName.trim());
        setNewFolderName("");
    };

    const toggleFolder = (id: string) =>
        setCollapsedFolders((prev) => ({ ...prev, [id]: !prev[id] }));

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [threadTitle, setThreadTitle] = useState<string>("");
    const [threadContent, setThreadContent] = useState<string>("");

    const channelList: Channel[] = Array.isArray(channels)
        ? channels
        : (channels as any)?.content || [];
    const selectedChannel = useMemo(
        () => channelList.find((c) => c.id === selectedChannelId),
        [channelList, selectedChannelId],
    );
    const threads: ChannelThread[] = channelDetail?.threads || [];

    const pinnedChannels = useMemo(
        () =>
            pinnedIds
                .map((id) => channelList.find((c) => c.id === id))
                .filter((c): c is Channel => Boolean(c)),
        [pinnedIds, channelList],
    );

    const handleMovePinned = (index: number, direction: -1 | 1) => {
        const next = [...pinnedIds];
        const swapWith = index + direction;
        if (swapWith < 0 || swapWith >= next.length) return;
        [next[index], next[swapWith]] = [next[swapWith], next[index]];
        reorderPinned(next);
    };

    const [threadSearch, setThreadSearch] = useState<string>("");
    const [threadSort, setThreadSort] = useState<"newest" | "oldest" | "posts">("newest");
    const [threadPage, setThreadPage] = useState<number>(1);
    const debouncedThreadSearch = useDebounce(threadSearch, 250);
    const THREAD_PAGE_SIZE = 8;

    const filteredThreads = useMemo(() => {
        return threads.filter((t) => {
            if (!debouncedThreadSearch) return true;
            const q = debouncedThreadSearch.toLowerCase();
            return t.title?.toLowerCase().includes(q) || t.authorName?.toLowerCase().includes(q);
        });
    }, [threads, debouncedThreadSearch]);

    const sortedThreads = useMemo(() => {
        const arr = [...filteredThreads];
        if (threadSort === "newest") {
            arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (threadSort === "oldest") {
            arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else {
            arr.sort((a, b) => (b.postCount ?? 0) - (a.postCount ?? 0));
        }
        return arr;
    }, [filteredThreads, threadSort]);

    const threadTotalPages = Math.ceil(sortedThreads.length / THREAD_PAGE_SIZE);
    const paginatedThreads = sortedThreads.slice(
        (threadPage - 1) * THREAD_PAGE_SIZE,
        threadPage * THREAD_PAGE_SIZE,
    );

    const prevPath =
        threadPage > 1 && threadTotalPages > 1 ? `/channels?page=${threadPage - 1}` : undefined;
    const nextPath =
        threadPage < threadTotalPages && threadTotalPages > 1
            ? `/channels?page=${threadPage + 1}`
            : undefined;

    useEffect(() => {
        setThreadPage(1);
    }, [debouncedThreadSearch, threadSort, selectedChannelId]);

    const handleCreateThread = () => {
        if (!threadTitle.trim()) return;
        createThread.mutate(
            { title: threadTitle, content: threadContent },
            {
                onSuccess: () => {
                    setDialogOpen(false);
                    setThreadTitle("");
                    setThreadContent("");
                },
            },
        );
    };

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("channels.title")} — LernChih`}
                description={t("channels.description")}
                canonicalPath="/channels"
                prevPath={prevPath}
                nextPath={nextPath}
                robots={hasQueryParams ? "noindex, follow" : "index, follow"}
                hreflang
            />
            <header className={styles.pageHeader}>
                <h1 className={styles.title}>{t("channels.title")}</h1>
                <div className={styles.headerActions}>
                    {selectedChannelId &&
                        (authenticated ? (
                            <Dialog
                                open={dialogOpen}
                                onOpenChange={(_: unknown, d: { open: boolean }) =>
                                    setDialogOpen(d.open)
                                }
                            >
                                <DialogTrigger disableButtonEnhancement>
                                    <Button variant="primary" icon={<Add24Regular />}>
                                        {t("channels.newThread")}
                                    </Button>
                                </DialogTrigger>
                                <DialogSurface>
                                    <DialogBody>
                                        <DialogTitle>{t("channels.createThread")}</DialogTitle>
                                        <DialogContent>
                                            {createThread.isError && (
                                                <MessageBar intent="error">
                                                    <MessageBarBody>
                                                        {t("channels.threadLoadError")}
                                                    </MessageBarBody>
                                                </MessageBar>
                                            )}
                                            <div className={styles.form}>
                                                <Field label={t("channels.threadTitle")} required>
                                                    <Input
                                                        value={threadTitle}
                                                        onChange={(
                                                            e: React.ChangeEvent<HTMLInputElement>,
                                                        ) => setThreadTitle(e.target.value)}
                                                        placeholder={t("channels.threadTitle")}
                                                    />
                                                </Field>
                                                <Field label={t("channels.threadContent")}>
                                                    <Textarea
                                                        value={threadContent}
                                                        onChange={(
                                                            e: React.ChangeEvent<HTMLTextAreaElement>,
                                                        ) => setThreadContent(e.target.value)}
                                                        placeholder={t("channels.threadContent")}
                                                    />
                                                </Field>
                                            </div>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button
                                                variant="subtle"
                                                onClick={() => setDialogOpen(false)}
                                            >
                                                {t("common.cancel")}
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={handleCreateThread}
                                                disabled={createThread.isPending || !threadTitle.trim()}
                                            >
                                                {createThread.isPending ? (
                                                    <Spinner size="tiny" />
                                                ) : (
                                                    t("common.create")
                                                )}
                                            </Button>
                                        </DialogActions>
                                    </DialogBody>
                                </DialogSurface>
                            </Dialog>
                        ) : (
                            <Link to="/login?redirect=/channels" className={styles.loginLink}>
                                {t("auth.loginToStartThread")}
                            </Link>
                        ))}
                </div>
            </header>

            {isLoading && (
                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner label={t("common.loading")} />
                </div>
            )}
            {isError && (
                <ErrorState
                    icon={<Chat24Regular />}
                    title={t("error.channelsTitle")}
                    description={t("error.channelsDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("error.tryAgain")}
                />
            )}

            {!isLoading && !isError && channelList.length === 0 && (
                <EmptyState
                    icon={<Chat24Regular />}
                    title={t("empty.channelsTitle")}
                    description={t("empty.channelsDescription")}
                />
            )}

            {!isLoading && !isError && channelList.length > 0 && (
            <div className={styles.split}>
                {/* Channel list */}
                <div className={`${styles.list} ${styles.splitAside}`}>
                    {/* Pinned channels (F51) */}
                    {pinnedChannels.length > 0 && (
                        <section className={folderStyles.foldersSection}>
                            <div className={folderStyles.folderHeader}>
                                <span className={folderStyles.folderHeaderButton}>
                                    <span className={folderStyles.folderIcon}>
                                        <Pin24Regular />
                                    </span>
                                    <span>{t("channelPinning.pinned", "Pinned")}</span>
                                    <Badge variant="accent" size="small">
                                        {pinnedChannels.length}
                                    </Badge>
                                </span>
                            </div>
                            <div className={folderStyles.folderBody}>
                                {pinnedChannels.map((channel, index) => (
                                    <div key={channel.id} className={folderStyles.folderItemRow}>
                                        <HoverLift>
                                            <Card
                                                className={`${styles.item} ${styles.itemClickable}${
                                                    selectedChannelId === channel.id
                                                        ? ` ${styles.itemSelected}`
                                                        : ""
                                                }`}
                                                padding="sm"
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setSelectedChannelId(channel.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        setSelectedChannelId(channel.id);
                                                    }
                                                }}
                                            >
                                                <span className={styles.itemTitle}>{channel.name}</span>
                                            </Card>
                                        </HoverLift>
                                        <Tooltip content={t("channelPinning.moveUp", "Move up")} relationship="label">
                                            <Button
                                                variant="subtle"
                                                size="small"
                                                icon={<ArrowUp24Regular />}
                                                onClick={() => handleMovePinned(index, -1)}
                                                disabled={index === 0}
                                                aria-label={t("channelPinning.moveUp", "Move up")}
                                            />
                                        </Tooltip>
                                        <Tooltip content={t("channelPinning.moveDown", "Move down")} relationship="label">
                                            <Button
                                                variant="subtle"
                                                size="small"
                                                icon={<ArrowDown24Regular />}
                                                onClick={() => handleMovePinned(index, 1)}
                                                disabled={index === pinnedChannels.length - 1}
                                                aria-label={t("channelPinning.moveDown", "Move down")}
                                            />
                                        </Tooltip>
                                        <Tooltip content={t("channelPinning.unpin", "Unpin")} relationship="label">
                                            <Button
                                                variant="subtle"
                                                size="small"
                                                icon={<PinOff24Regular />}
                                                onClick={() => unpinChannel(channel.id)}
                                                aria-label={t("channelPinning.unpin", "Unpin")}
                                            />
                                        </Tooltip>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Folder management (F50) */}
                    <div className={folderStyles.newFolderRow}>
                        <input
                            className={folderStyles.newFolderInput}
                            value={newFolderName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setNewFolderName(e.target.value)
                            }
                            placeholder={t("channelFolders.newFolderPlaceholder", "New folder name")}
                            aria-label={t("channelFolders.newFolderPlaceholder", "New folder name")}
                        />
                        <Button
                            variant="outline"
                            size="small"
                            icon={<FolderAdd24Regular />}
                            onClick={handleCreateFolder}
                            disabled={!newFolderName.trim()}
                        >
                            {t("channelFolders.createFolder", "New folder")}
                        </Button>
                    </div>

                    {/* Collapsible folder sections */}
                    {folders.map((folder) => {
                        const collapsed = collapsedFolders[folder.id] ?? false;
                        const folderChannels = folder.channelIds
                            .map((cid) => channelList.find((c) => c.id === cid))
                            .filter((c): c is Channel => Boolean(c));
                        return (
                            <section key={folder.id} className={folderStyles.foldersSection}>
                                <div className={folderStyles.folderHeader}>
                                    <button
                                        type="button"
                                        className={folderStyles.folderHeaderButton}
                                        onClick={() => toggleFolder(folder.id)}
                                        aria-expanded={!collapsed}
                                        aria-controls={`folder-body-${folder.id}`}
                                    >
                                        <span className={folderStyles.folderIcon}>
                                            <Folder24Regular />
                                        </span>
                                        <span>{folder.name}</span>
                                        <Badge variant="neutral" size="small">
                                            {folderChannels.length}
                                        </Badge>
                                        <span
                                            className={
                                                collapsed
                                                    ? folderStyles.chevronIcon
                                                    : `${folderStyles.chevronIcon} ${folderStyles.chevronExpanded}`
                                            }
                                        >
                                            <ChevronRight24Regular />
                                        </span>
                                    </button>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Dismiss24Regular />}
                                        onClick={() => deleteFolder(folder.id)}
                                        aria-label={t("channelFolders.deleteFolder", "Delete folder")}
                                    />
                                </div>
                                {!collapsed && (
                                    <div
                                        id={`folder-body-${folder.id}`}
                                        className={folderStyles.folderBody}
                                    >
                                        {folderChannels.length === 0 && (
                                            <p className={styles.itemBody}>
                                                {t("channelFolders.emptyFolder", "No channels in this folder.")}
                                            </p>
                                        )}
                                        {folderChannels.map((channel) => (
                                            <div key={channel.id} className={folderStyles.folderItemRow}>
                                                <HoverLift>
                                                    <Card
                                                        className={`${styles.item} ${styles.itemClickable}${
                                                            selectedChannelId === channel.id
                                                                ? ` ${styles.itemSelected}`
                                                                : ""
                                                        }`}
                                                        padding="sm"
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => setSelectedChannelId(channel.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" || e.key === " ") {
                                                                e.preventDefault();
                                                                setSelectedChannelId(channel.id);
                                                            }
                                                        }}
                                                    >
                                                        <span className={styles.itemTitle}>{channel.name}</span>
                                                    </Card>
                                                </HoverLift>
                                                <Tooltip content={t("channelFolders.removeFromFolder", "Remove from folder")} relationship="label">
                                                    <Button
                                                        variant="subtle"
                                                        size="small"
                                                        icon={<Dismiss24Regular />}
                                                        onClick={() =>
                                                            removeChannelFromFolder(folder.id, channel.id)
                                                        }
                                                        aria-label={t(
                                                            "channelFolders.removeFromFolder",
                                                            "Remove from folder",
                                                        )}
                                                    />
                                                </Tooltip>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })}

                    {/* Channels not in any folder */}
                    <StaggerReveal>
                        {channelList
                            .filter(
                                (c) => !folderedChannelIds.has(c.id) && !pinnedIds.includes(c.id),
                            )
                            .map((channel) => (
                                <HoverLift key={channel.id}>
                                    <article>
                                        <Card
                                            className={`${styles.item} ${styles.itemClickable}${
                                                selectedChannelId === channel.id
                                                    ? ` ${styles.itemSelected}`
                                                    : ""
                                            }`}
                                            padding="md"
                                            onClick={() => setSelectedChannelId(channel.id)}
                                        >
                                            <div className={styles.itemHeader}>
                                                <h2 className={styles.itemTitle}>{channel.name}</h2>
                                                <div className={folderStyles.folderItemRow}>
                                                    <Badge variant="neutral" size="small">
                                                        {channel.threadCount ?? 0} {t("channels.threads")}
                                                    </Badge>
                                                    <Tooltip content={t("channelPinning.pin", "Pin")} relationship="label">
                                                        <Button
                                                            variant="subtle"
                                                            size="small"
                                                            icon={<Pin24Regular />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                pinChannel(channel.id);
                                                            }}
                                                            aria-label={t("channelPinning.pin", "Pin")}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </div>
                                            {channel.description && (
                                                <p className={styles.itemBody}>{channel.description}</p>
                                            )}
                                            {folders.length > 0 && (
                                                <div
                                                    className={folderStyles.newFolderRow}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className={folderStyles.addToFolderLabel}>
                                                        {t("channelFolders.addToFolder", "Add to folder")}
                                                    </span>
                                                    <Dropdown
                                                        size="small"
                                                        placeholder={t(
                                                            "channelFolders.chooseFolder",
                                                            "Choose folder",
                                                        )}
                                                        aria-label={t(
                                                            "channelFolders.chooseFolder",
                                                            "Choose folder",
                                                        )}
                                                        onOptionSelect={(_: unknown, data: { optionValue?: string }) => {
                                                            if (data.optionValue) {
                                                                addChannelToFolder(data.optionValue, channel.id);
                                                            }
                                                        }}
                                                    >
                                                        {folders.map((f) => (
                                                            <Option key={f.id} value={f.id}>
                                                                {f.name}
                                                            </Option>
                                                        ))}
                                                    </Dropdown>
                                                </div>
                                            )}
                                        </Card>
                                    </article>
                                </HoverLift>
                            ))}
                    </StaggerReveal>
                </div>

                {/* Threads for selected channel */}
                {selectedChannelId && (
                    <section
                        className={styles.splitMain}
                        aria-label={t("channels.threads")}
                    >
                        <h2 className={styles.panelTitle}>
                            {channelDetail?.name || t("channels.title")} — {t("channels.threads")}
                        </h2>
                        <div className={styles.toolbar}>
                            <Input
                                placeholder={t("channels.searchThreads")}
                                value={threadSearch}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setThreadSearch(e.target.value)
                                }
                                className={styles.searchFluid}
                                aria-label={t("channels.searchThreads")}
                            />
                            <Dropdown
                                placeholder={t("common.sortBy")}
                                aria-label={t("common.sortBy")}
                                value={
                                    threadSort === "newest"
                                        ? t("resources.newest")
                                        : threadSort === "oldest"
                                          ? t("resources.oldest")
                                          : t("channels.mostPosts")
                                }
                                selectedOptions={[threadSort]}
                                onOptionSelect={(_: unknown, data: { optionValue?: string }) =>
                                    data.optionValue &&
                                    setThreadSort(data.optionValue as "newest" | "oldest" | "posts")
                                }
                            >
                                <Option value="newest">{t("resources.newest")}</Option>
                                <Option value="oldest">{t("resources.oldest")}</Option>
                                <Option value="posts">{t("channels.mostPosts")}</Option>
                            </Dropdown>
                        </div>
                        <StaggerReveal className={styles.list}>
                            {threads.length === 0 && (
                                <p className={styles.itemBody}>{t("channels.noThreads")}</p>
                            )}
                            {threads.length > 0 && sortedThreads.length === 0 && (
                                <p className={styles.itemBody}>{t("channels.noMatches")}</p>
                            )}
                            {/* TODO(perf): When threads exceed ~100 items, add list
                  virtualization (e.g. react-window / react-virtual) to avoid
                  rendering off-screen cards. Not added now to keep the change
                  dependency-free. Keys are already stable (thread.id). */}
                            {paginatedThreads.map((thread) => (
                                <HoverLift key={thread.id}>
                                    <article>
                                        <Card
                                            className={`${styles.item} ${styles.itemClickable}`}
                                            padding="md"
                                            onClick={() =>
                                                navigate(
                                                    `/channels/${selectedChannel?.slug || selectedChannelId}/threads/${thread.id}`,
                                                )
                                            }
                                        >
                                            <h3 className={styles.itemTitle}>{thread.title}</h3>
                                            <div className={styles.itemMeta}>
                                                <span>
                                                    {t("common.byAuthor", {
                                                        author:
                                                            thread.authorName ||
                                                            t("common.unknown"),
                                                    })}
                                                </span>
                                                <Badge variant="neutral" size="small">
                                                    {thread.postCount ?? 0} {t("channels.posts")}
                                                </Badge>
                                            </div>
                                        </Card>
                                    </article>
                                </HoverLift>
                            ))}
                        </StaggerReveal>
                        <Pagination
                            currentPage={threadPage}
                            totalPages={threadTotalPages}
                            onPageChange={setThreadPage}
                        />
                    </section>
                )}
            </div>
            )}
        </div>
    );
}
