import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Spinner } from "@fluentui/react-components";
import { ChatMultiple24Regular } from "@fluentui/react-icons";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    useConversations,
    useConversation,
    useSendDirectMessage,
    usePresence,
    useHeartbeat,
} from "@/hooks/useDirectMessages";
import styles from "./MessagesPage.module.css";

export default function MessagesPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const myId = user?.userId ?? null;

    const [selectedPartner, setSelectedPartner] = useState<number | null>(null);
    const [draft, setDraft] = useState("");

    const conversations = useConversations();
    const conversation = useConversation(selectedPartner);
    const presence = usePresence(selectedPartner);
    const sendMessage = useSendDirectMessage(selectedPartner ?? 0);
    // Keep the current user "online" while the messages page is mounted.
    useHeartbeat(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const messages = conversation.data ?? [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleSend = () => {
        const content = draft.trim();
        if (!content || selectedPartner == null) return;
        sendMessage.mutate(
            { content },
            {
                onSuccess: () => setDraft(""),
            },
        );
    };

    const partnerName = conversations.data?.find(
        (c) => c.partnerId === selectedPartner,
    )?.partnerName;

    const isOnline = presence.data?.online ?? false;

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("messages.title")} — LernChih`}
                description={t("messages.description")}
                canonicalPath="/messages"
                robots="noindex, follow"
            />
            <header className={styles.pageHeader}>
                <div>
                    <h1 className={styles.title}>{t("messages.title")}</h1>
                    <p className={styles.subtitle}>{t("messages.description")}</p>
                </div>
            </header>

            <div className={styles.split}>
                {/* Conversation list */}
                <aside className={styles.sidebar} aria-label={t("messages.conversations")}>
                    <div className={styles.sidebarHeader}>{t("messages.conversations")}</div>
                    {conversations.isLoading && (
                        <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                            <Spinner size="tiny" aria-hidden="true" />
                        </div>
                    )}
                    {conversations.data && conversations.data.length === 0 && (
                        <div className={styles.emptySidebar}>{t("messages.noConversations")}</div>
                    )}
                    <div className={styles.conversationList} role="list">
                        {conversations.data?.map((c) => {
                            const active = c.partnerId === selectedPartner;
                            return (
                                <button
                                    key={c.partnerId}
                                    type="button"
                                    role="listitem"
                                    className={`${styles.conversationItem} ${active ? styles.conversationActive : ""}`}
                                    onClick={() => setSelectedPartner(c.partnerId)}
                                    aria-current={active ? "true" : undefined}
                                >
                                    <div className={styles.conversationAvatar}>
                                        <Avatar name={c.partnerName} size={36} />
                                        <span
                                            className={`${styles.dot} ${styles.dotOnline}`}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className={styles.conversationInfo}>
                                        <span className={styles.conversationName}>
                                            {c.partnerName}
                                        </span>
                                        <span className={styles.conversationPreview}>
                                            {c.lastMessagePreview}
                                        </span>
                                    </div>
                                    {c.unreadCount > 0 && (
                                        <span className={styles.unreadBadge}>{c.unreadCount}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Thread view */}
                <section className={styles.thread} aria-label={t("messages.thread")}>
                    {selectedPartner == null ? (
                        <div className={styles.emptyThread}>
                            <ChatMultiple24Regular />
                            <p>{t("messages.selectPrompt")}</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.threadHeader}>
                                <Avatar name={partnerName ?? "?"} size={40} />
                                <div className={styles.threadHeaderInfo}>
                                    <h2 className={styles.threadName}>
                                        {partnerName ?? t("common.unknown")}
                                    </h2>
                                    <span
                                        className={`${styles.presenceLabel} ${isOnline ? styles.presenceLabelOnline : ""}`}
                                    >
                                        {isOnline
                                            ? t("messages.online")
                                            : t("messages.offline")}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.messages} role="log" aria-live="polite">
                                {conversation.isLoading && (
                                    <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                                        <Spinner size="tiny" aria-hidden="true" />
                                    </div>
                                )}
                                {messages.length === 0 && !conversation.isLoading && (
                                    <div className={styles.emptyThread}>
                                        <p>{t("messages.emptyConversation")}</p>
                                    </div>
                                )}
                                {messages.map((m) => {
                                    const mine = m.fromUserId === myId;
                                    return (
                                        <div
                                            key={m.id}
                                            className={`${styles.bubbleRow} ${mine ? styles.bubbleRowMine : ""}`}
                                        >
                                            <div
                                                className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleTheirs}`}
                                            >
                                                {m.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form
                                className={styles.composer}
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                            >
                                <Input
                                    className={styles.composerInput}
                                    value={draft}
                                    onChange={(_e, data) => setDraft(data.value)}
                                    placeholder={t("messages.composerPlaceholder")}
                                    aria-label={t("messages.composerPlaceholder")}
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={!draft.trim() || sendMessage.isPending}
                                >
                                    {t("messages.send")}
                                </Button>
                            </form>
                        </>
                    )}
                </section>
            </div>

            {conversations.data && conversations.data.length === 0 && (
                <EmptyState
                    icon={<ChatMultiple24Regular />}
                    title={t("messages.emptyTitle")}
                    description={t("messages.emptyDescription")}
                />
            )}
        </div>
    );
}
