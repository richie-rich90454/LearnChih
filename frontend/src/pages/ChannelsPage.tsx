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
} from "@fluentui/react-components";
import { Add24Regular, Chat24Regular } from "@fluentui/react-icons";
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
import styles from "./List.module.css";

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

            {isLoading && <Spinner label={t("common.loading")} />}
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
                <StaggerReveal className={`${styles.list} ${styles.splitAside}`}>
                    {channelList.map((channel) => (
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
                                        <h3 className={styles.itemTitle}>{channel.name}</h3>
                                        <Badge variant="neutral" size="small">
                                            {channel.threadCount ?? 0} {t("channels.threads")}
                                        </Badge>
                                    </div>
                                    {channel.description && (
                                        <p className={styles.itemBody}>{channel.description}</p>
                                    )}
                                </Card>
                            </article>
                        </HoverLift>
                    ))}
                </StaggerReveal>

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
