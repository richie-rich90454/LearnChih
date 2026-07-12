import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Textarea, Avatar, Spinner, Dropdown, Option } from "@fluentui/react-components";
import { ArrowLeft24Regular, Mention24Regular, ChatMultiple24Regular } from "@fluentui/react-icons";
import { useChannel, useChannelPosts, useCreateChannelPost, useChannels } from "@/hooks/useChannels";
import useWebSocket from "@/hooks/useWebSocket";
import useAuthStore from "@/store/authStore";
import { useTranslation } from "react-i18next";
import type { Post, PostFormat, Channel } from "@/types";
import Seo from "@/components/Seo";
import { StaggerReveal } from "@/components/StaggerReveal";
import { PresenceIndicator } from "@/components/PresenceIndicator";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { ThreadBadges } from "@/components/ThreadBadges";
import { ReactionPicker } from "@/components/ReactionPicker";
import { AmaPanel } from "@/components/AmaPanel";
import { ThreadMergeDialog } from "@/components/ThreadMergeDialog";
import { ThreadMoveDialog } from "@/components/ThreadMoveDialog";
import { RevisionDiffButton } from "@/components/RevisionDiffViewer";
import { CustomEmojiUploader } from "@/components/CustomEmojiUploader";
import { ErrorState } from "@/components/ErrorState";
import ReportButton from "@/components/ReportButton";
import { discussionForumPostingSchema, breadcrumbSchema } from "@/components/jsonLd";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MuteButton } from "@/components/MuteButton";
import { recordLastVisited } from "@/components/ResumeCard";
import { ShareButton } from "@/components/ShareButton";
import { ThreadSubscription } from "@/components/ThreadSubscription";
import styles from "./Detail.module.css";

function getBaseUrl(): string {
    const envBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL;
    if (envBaseUrl) return envBaseUrl.replace(/\/$/, "");
    if (typeof window !== "undefined") return window.location.origin;
    return "";
}

export default function ChannelThreadPage() {
    const { t } = useTranslation();
    const { channelId, threadId } = useParams<{ channelId: string; threadId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: channel } = useChannel(channelId);
    const { data: posts, isLoading, isError, refetch } = useChannelPosts(channelId, threadId);
    const createPost = useCreateChannelPost(channelId, threadId);
    const { data: allChannelsData } = useChannels();
    const queryClient = useQueryClient();
    const {
        subscribeToChannelThread,
        subscribeToTyping,
        sendTypingIndicator,
        sendChannelBroadcast,
    } = useWebSocket();
    const { queueWrite, isOnline } = useBackgroundSync();
    const { user, isAuthenticated } = useAuthStore();
    const authenticated = isAuthenticated();

    const [newPost, setNewPost] = useState<string>("");
    const [postFormat, setPostFormat] = useState<PostFormat>("PLAIN");
    const [replyToPostId, setReplyToPostId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState<string>("");
    const [typingUsers, setTypingUsers] = useState<Record<number, string>>({});
    const typingTimeoutRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
    const [readPostIds, setReadPostIds] = useState<Set<number>>(new Set());

    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

    const allChannels: Channel[] = Array.isArray(allChannelsData)
        ? allChannelsData
        : (allChannelsData as { content?: Channel[] } | undefined)?.content ?? [];

    // Subscribe to real-time updates
    useEffect(() => {
        if (!threadId) return;
        const unsubscribe = subscribeToChannelThread(threadId, () => {});
        return unsubscribe;
    }, [threadId, subscribeToChannelThread]);

    // Subscribe to typing indicators
    useEffect(() => {
        if (!threadId) return;
        const unsubscribe = subscribeToTyping(threadId, (event) => {
            if (!event.userId || event.userId === user?.userId) return;
            if (event.typing) {
                setTypingUsers((prev) => ({
                    ...prev,
                    [event.userId]: event.userName || "Someone",
                }));
                if (typingTimeoutRef.current[event.userId]) {
                    clearTimeout(typingTimeoutRef.current[event.userId]);
                }
                typingTimeoutRef.current[event.userId] = setTimeout(() => {
                    setTypingUsers((prev) => {
                        const next = { ...prev };
                        delete next[event.userId];
                        return next;
                    });
                }, 3000);
            } else {
                setTypingUsers((prev) => {
                    const next = { ...prev };
                    delete next[event.userId];
                    return next;
                });
            }
        });
        return () => {
            unsubscribe();
            Object.values(typingTimeoutRef.current).forEach(clearTimeout);
        };
    }, [threadId, subscribeToTyping, user?.userId]);

    const handlePost = () => {
        if (!newPost.trim()) return;
        const body = { content: newPost, format: postFormat };
        if (isOnline) {
            createPost.mutate(body, {
                onSuccess: () => setNewPost(""),
            });
            return;
        }
        // Offline: queue the write and clear the input. The list will refresh on reconnect.
        queueWrite(
            `${window.location.origin}/api/channels/${channelId}/threads/${threadId}/posts`,
            "POST",
            body,
            () => {
                queryClient.invalidateQueries({ queryKey: ["channelPosts", channelId, threadId] });
            },
        );
        setNewPost("");
    };

    const handleReply = (postId: number) => {
        if (!replyContent.trim()) return;
        const body = { content: replyContent, format: postFormat, parentPostId: postId };
        if (isOnline) {
            createPost.mutate(body, {
                onSuccess: () => {
                    setReplyContent("");
                    setReplyToPostId(null);
                },
            });
            return;
        }
        // Offline: queue the reply and close the form. The list will refresh on reconnect.
        queueWrite(
            `${window.location.origin}/api/channels/${channelId}/threads/${threadId}/posts`,
            "POST",
            body,
            () => {
                queryClient.invalidateQueries({ queryKey: ["channelPosts", channelId, threadId] });
            },
        );
        setReplyContent("");
        setReplyToPostId(null);
    };

    const handlePostInputChange = useCallback(
        (value: string) => {
            setNewPost(value);
            if (threadId && value.trim()) {
                sendTypingIndicator(threadId, true);
            }
        },
        [threadId, sendTypingIndicator],
    );

    const handleAtChannel = () => {
        const mention = "@channel ";
        setNewPost((prev) => (prev ? `${prev} ${mention}` : mention));
        if (threadId) sendChannelBroadcast(threadId, "@channel mention composed");
    };

    // Find the current thread from channel data
    const thread = channel?.threads?.find((t) => String(t.id) === String(threadId));

    const postList: Post[] = Array.isArray(posts) ? posts : (posts as any)?.content || [];

    // Mark visible posts as read (client-side stub until backend exposes read receipts).
    useEffect(() => {
        if (!postList.length) return;
        setReadPostIds((prev) => {
            const next = new Set(prev);
            postList.forEach((p) => next.add(p.id));
            return next;
        });
    }, [postList]);

    // Record this visit for the dashboard "Continue where you left off" card.
    useEffect(() => {
        if (thread?.title) {
            recordLastVisited(location.pathname, thread.title);
        }
    }, [thread?.title, location.pathname]);

    const threadTitle = thread?.title || "Thread";
    const canonicalPath = `/channels/${channel?.slug || channelId}/threads/${threadId}`;
    const baseUrl = getBaseUrl();
    const threadUrl = `${baseUrl}${canonicalPath}`;
    const jsonLd = [
        discussionForumPostingSchema({
            title: threadTitle,
            description: threadTitle,
            url: threadUrl,
            author: thread?.authorName || thread?.userName,
            datePublished: thread?.createdAt,
        }),
        breadcrumbSchema([
            { name: "Channels", url: `${baseUrl}/channels` },
            { name: channel?.name || "Channel", url: `${baseUrl}/channels` },
            { name: threadTitle, url: threadUrl },
        ]),
    ];

    return (
        <div className={styles.container}>
            <Seo
                title={`${threadTitle} — LernChih`}
                description={`Discussion: ${threadTitle} in ${channel?.name || "a channel"} on LernChih.`}
                canonicalPath={canonicalPath}
                jsonLd={jsonLd}
                hreflang
            />
            {/* Back */}
            <div className={styles.backRow}>
                <Button
                    variant="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate("/channels")}
                >
                    {t("channels.backToChannels")}
                </Button>
                <ShareButton title={threadTitle} url={threadUrl} />
                {authenticated && threadId && (
                    <ThreadSubscription threadId={Number(threadId)} />
                )}
                {isAdmin && threadId && (
                    <ThreadMergeDialog
                        threadId={Number(threadId)}
                        threads={channel?.threads ?? []}
                    />
                )}
                {isAdmin && channel && (
                    <ThreadMoveDialog
                        currentChannelId={channel.id}
                        channels={allChannels}
                    />
                )}
            </div>

            {/* Thread info */}
            <Card padding="lg" className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.meta}>
                        <h1 className={styles.title}>{thread?.title || t("channels.threads")}</h1>
                        {threadId && <PresenceIndicator threadId={Number(threadId)} />}
                        {threadId && (
                            <MuteButton id={`thread:${threadId}`} type="thread" />
                        )}
                    </div>
                    <p className={styles.metaItem}>
                        {t("channels.inChannel", { channel: channel?.name || t("channels.title") })}
                    </p>
                </div>
                <ThreadBadges
                    status={{
                        pinned: thread?.pinned,
                        locked: thread?.locked,
                        qaMode: thread?.qaMode,
                    }}
                />
            </Card>

            {threadId && (
                <AmaPanel
                    threadId={Number(threadId)}
                    isOwner={isAdmin || thread?.userId === user?.userId}
                />
            )}

            {/* New post */}
            {authenticated ? (
                <div className={styles.newPostRow}>
                    <Textarea
                        value={newPost}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            handlePostInputChange(e.target.value)
                        }
                        placeholder={
                            thread?.locked
                                ? t("channels.lockedPlaceholder")
                                : t("channels.writeReply")
                        }
                        className={styles.composerField}
                        disabled={thread?.locked}
                    />
                    <Dropdown
                        value={
                            postFormat === "MARKDOWN" ? t("channels.markdown") : t("channels.plain")
                        }
                        selectedOptions={[postFormat]}
                        onOptionSelect={(_: unknown, data: { optionValue?: string }) =>
                            setPostFormat((data.optionValue as PostFormat) || "PLAIN")
                        }
                        disabled={thread?.locked}
                    >
                        <Option value="PLAIN">{t("channels.plain")}</Option>
                        <Option value="MARKDOWN">{t("channels.markdown")}</Option>
                    </Dropdown>
                    {!thread?.locked && <CustomEmojiUploader />}
                    {isAdmin && (
                        <Button
                            variant="outline"
                            icon={<Mention24Regular />}
                            onClick={handleAtChannel}
                            disabled={thread?.locked}
                            title={t("channels.mentionChannel")}
                        >
                            @channel
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        onClick={handlePost}
                        disabled={createPost.isPending || !newPost.trim() || thread?.locked}
                    >
                        {createPost.isPending ? <Spinner size="tiny" /> : t("channels.reply")}
                    </Button>
                </div>
            ) : (
                <Link
                    to={`/login?redirect=/channels/${channelId}/threads/${threadId}`}
                    className={styles.link}
                >
                    {t("auth.loginToReply")}
                </Link>
            )}

            {/* Typing indicator */}
            <div className={styles.typingRow} aria-live="polite">
                {Object.keys(typingUsers).length > 0 && (
                    <>
                        <Spinner size="tiny" />
                        <span>
                            {Object.values(typingUsers).join(", ")}{" "}
                            {Object.keys(typingUsers).length === 1
                                ? t("thread.typing", {
                                      users: Object.values(typingUsers).join(", "),
                                  })
                                : t("thread.typingPlural", {
                                      users: Object.values(typingUsers).join(", "),
                                  })}
                        </span>
                    </>
                )}
            </div>

            {/* Posts */}
            {isLoading && <Spinner label={t("common.loading")} />}
            {isError && (
                <ErrorState
                    icon={<ChatMultiple24Regular />}
                    title={t("error.threadTitle")}
                    description={t("error.threadDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("error.tryAgain")}
                />
            )}
            <section className={styles.thread} aria-label={t("channels.threads")}>
                <StaggerReveal className={styles.postsList}>
                    {postList.length === 0 && !isLoading && (
                        <p className={styles.emptyText}>{t("thread.noPosts")}</p>
                    )}
                    {postList.map((post) => (
                        <article key={post.id}>
                            <Card padding="md" className={styles.post}>
                                <div className={styles.postHeader}>
                                    <Avatar
                                        name={post.authorName || t("common.user")}
                                        size={32}
                                        className={styles.avatar}
                                    />
                                    <span className={styles.postAuthor}>
                                        {post.authorName || t("common.unknown")}
                                    </span>
                                    {post.createdAt && (
                                        <time
                                            className={styles.postMeta}
                                            dateTime={new Date(post.createdAt).toISOString()}
                                        >
                                            {new Date(post.createdAt).toLocaleString()}
                                        </time>
                                    )}
                                </div>
                                {post.format === "MARKDOWN" ? (
                                    <div className={styles.postBody}>
                                        <MarkdownPreview content={post.content} />
                                    </div>
                                ) : (
                                    <div className={styles.postBody}>{post.content}</div>
                                )}
                                <div className={styles.postActions}>
                                    {authenticated && <ReactionPicker postId={post.id} />}
                                    {authenticated && !thread?.locked && (
                                        <Button
                                            variant="subtle"
                                            size="small"
                                            onClick={() => {
                                                setReplyToPostId(post.id);
                                                setReplyContent("");
                                            }}
                                        >
                                            {t("channels.reply")}
                                        </Button>
                                    )}
                                    {authenticated && (
                                        <ReportButton targetType="CHANNEL_POST" targetId={post.id} />
                                    )}
                                    <RevisionDiffButton postId={post.id} />
                                    {readPostIds.has(post.id) && post.userId === user?.userId && (
                                        <span className={styles.readReceipt}>{t("thread.read")}</span>
                                    )}
                                </div>
                                {authenticated && replyToPostId === post.id && !thread?.locked && (
                                    <div className={styles.replyComposer}>
                                        <Textarea
                                            value={replyContent}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                setReplyContent(e.target.value)
                                            }
                                            placeholder={t("channels.writeReply")}
                                        />
                                        <div className={styles.replyComposerActions}>
                                            <Button
                                                variant="subtle"
                                                size="small"
                                                onClick={() => setReplyToPostId(null)}
                                            >
                                                {t("common.cancel")}
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="small"
                                                disabled={!replyContent.trim() || createPost.isPending}
                                                onClick={() => handleReply(post.id)}
                                            >
                                                {createPost.isPending ? (
                                                    <Spinner size="tiny" />
                                                ) : (
                                                    t("channels.postReply")
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </article>
                    ))}
                </StaggerReveal>
            </section>
        </div>
    );
}
