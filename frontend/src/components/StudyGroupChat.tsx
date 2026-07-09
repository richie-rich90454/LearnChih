import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Spinner } from "@fluentui/react-components";
import { useGroupMessages, useSendGroupMessage } from "@/hooks/useGroupMessages";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./StudyGroupChat.module.css";

interface StudyGroupChatProps {
    groupId: number;
}

/**
 * Chat panel rendered inside the study-group chat dialog (F32). Shows the
 * message history for the group and a composer to post new messages.
 * Polls for new messages every 5s.
 */
export function StudyGroupChat({ groupId }: StudyGroupChatProps) {
    const { t } = useTranslation();

    const { data: messages, isLoading } = useGroupMessages(groupId);
    const send = useSendGroupMessage(groupId);

    const [draft, setDraft] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    const list = messages ?? [];

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [list.length]);

    const handleSend = () => {
        const content = draft.trim();
        if (!content) return;
        send.mutate(
            { content },
            { onSuccess: () => setDraft("") },
        );
    };

    return (
        <div className={styles.chat}>
            <div className={styles.messages} role="log" aria-live="polite">
                {isLoading && <Spinner size="tiny" />}
                {!isLoading && list.length === 0 && (
                    <div className={styles.empty}>{t("groupChat.empty")}</div>
                )}
                {list.map((m) => (
                    <div key={m.id} className={styles.message}>
                        <Avatar name={m.userName} size={32} />
                        <div className={styles.bubble}>
                            <span className={styles.author}>{m.userName}</span>
                            <span className={styles.content}>{m.content}</span>
                            <span className={styles.timestamp}>
                                {new Date(m.sentAt).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
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
                    placeholder={t("groupChat.composerPlaceholder")}
                    aria-label={t("groupChat.composerPlaceholder")}
                />
                <Button
                    type="submit"
                    variant="primary"
                    disabled={!draft.trim() || send.isPending}
                >
                    {t("groupChat.send")}
                </Button>
            </form>
        </div>
    );
}

export default StudyGroupChat;
