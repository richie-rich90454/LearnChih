import { useState } from "react";
import { Popover, PopoverTrigger, PopoverSurface, Button, Badge } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useReactions, useAddReaction, useRemoveReaction, type Reaction } from "../hooks/useSocial";
import useAuthStore from "../store/authStore";
import { ReactionRoster } from "./ReactionRoster";

const COMMON_EMOJIS = ["👍", "❤️", "🎉", "🔥", "👀", "💡", "🚀", "✅"];

interface ReactionPickerProps {
    postId: number;
}

export function ReactionPicker({ postId }: ReactionPickerProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [rosterEmoji, setRosterEmoji] = useState<string | null>(null);
    const { data: reactions, isLoading } = useReactions(postId);
    const addReaction = useAddReaction(postId);
    const removeReaction = useRemoveReaction(postId);
    const currentUser = useAuthStore((s) => s.user);

    const grouped = (reactions ?? []).reduce<Record<string, Reaction[]>>((acc, r) => {
        (acc[r.emoji] ||= []).push(r);
        return acc;
    }, {});

    const handleReact = (emoji: string) => {
        const mine = (reactions ?? []).find(
            (r) => r.emoji === emoji && r.userId === currentUser?.userId,
        );
        if (mine) {
            removeReaction.mutate(mine.id);
        } else {
            addReaction.mutate(emoji);
        }
        setOpen(false);
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", flexWrap: "wrap" }}>
            {Object.entries(grouped).map(([emoji, list]) => {
                const mine = list.some((r) => r.userId === currentUser?.userId);
                return (
                    <Popover
                        key={emoji}
                        open={rosterEmoji === emoji}
                        onOpenChange={(_, d) => {
                            setRosterEmoji(d.open ? emoji : null);
                        }}
                        openOnHover
                    >
                        <PopoverTrigger disableButtonEnhancement>
                            <Badge
                                appearance={mine ? "filled" : "outline"}
                                color={mine ? "brand" : "informative"}
                                style={{ cursor: "pointer" }}
                                onClick={() => handleReact(emoji)}
                                title={t("reactionPicker.reactionCount", { count: list.length })}
                            >
                                {emoji} {list.length}
                            </Badge>
                        </PopoverTrigger>
                        <PopoverSurface>
                            <ReactionRoster emoji={emoji} reactions={list} />
                        </PopoverSurface>
                    </Popover>
                );
            })}

            <Popover open={open} onOpenChange={(_, d) => setOpen(d.open)}>
                <PopoverTrigger disableButtonEnhancement>
                    <Button
                        appearance="subtle"
                        size="small"
                        aria-label={t("reactionPicker.addReaction")}
                        disabled={isLoading}
                    >
                        😊 +
                    </Button>
                </PopoverTrigger>
                <PopoverSurface
                    style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap", maxWidth: 280 }}
                >
                    {COMMON_EMOJIS.map((emoji) => (
                        <Button
                            key={emoji}
                            appearance="subtle"
                            size="large"
                            onClick={() => handleReact(emoji)}
                            aria-label={t("reactionPicker.reactWith", { emoji })}
                        >
                            {emoji}
                        </Button>
                    ))}
                </PopoverSurface>
            </Popover>
        </div>
    );
}
