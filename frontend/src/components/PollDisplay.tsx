import { useState, type DragEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, MessageBar, MessageBarBody } from "@fluentui/react-components";
import type { AxiosResponse } from "axios";
import api from "../api/axios";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useReducedMotion } from "../hooks/useReducedMotion";
import styles from "./PollDisplay.module.css";

export interface PollOption {
    id: number;
    text: string;
    voteCount: number;
}

export interface Poll {
    id: number;
    postId?: number;
    question: string;
    options: PollOption[];
    totalVotes: number;
    votedOptionId?: number;
}

export type PollMode = "single" | "ranking" | "openEnded";

interface PollDisplayProps {
    poll: Poll;
    mode?: PollMode;
}

/**
 * Poll display supporting three modes (F46):
 *  - single (default): one-choice vote with results bar (existing behavior).
 *  - ranking: drag-to-reorder list; the submitted order is the vote.
 *  - openEnded: free-text response submitted as the vote.
 *
 * The single mode keeps the original server-backed vote mutation; ranking and
 * openEnded use local state until a backend contract is defined.
 *
 * Spec ref: F46.
 */
export function PollDisplay({ poll, mode = "single" }: PollDisplayProps) {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const queryClient = useQueryClient();

    const voteMutation = useMutation({
        mutationFn: (optionId: number): Promise<AxiosResponse<Poll>> =>
            api.post<Poll>(`/polls/${poll.id}/vote`, { optionId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["poll", poll.id] });
            queryClient.invalidateQueries({ queryKey: ["polls"] });
        },
    });

    const hasVoted = poll.votedOptionId !== undefined;
    const total = poll.totalVotes || poll.options.reduce((sum, o) => sum + o.voteCount, 0);

    if (mode === "ranking") {
        return <RankingPoll poll={poll} reduced={reduced} />;
    }
    if (mode === "openEnded") {
        return <OpenEndedPoll poll={poll} reduced={reduced} />;
    }

    return (
        <div className={styles.root}>
            <div className={styles.questionRow}>
                <span className={styles.question}>{poll.question}</span>
                <Badge variant="neutral" size="small">
                    {t("polls.modeSingle", "Single choice")}
                </Badge>
            </div>

            {voteMutation.isError && (
                <MessageBar intent="error">
                    <MessageBarBody>{t("polls.voteFailed", "Failed to register your vote.")}</MessageBarBody>
                </MessageBar>
            )}

            {poll.options.map((option) => {
                const pct = total > 0 ? Math.round((option.voteCount / total) * 100) : 0;
                const chosen = poll.votedOptionId === option.id;
                return (
                    <div key={option.id} className={styles.optionRow}>
                        <div className={styles.optionTop}>
                            <span className={chosen ? styles.optionChosen : styles.optionText}>
                                {option.text}
                            </span>
                            {hasVoted ? (
                                <span className={styles.optionCount}>
                                    {pct}% · {option.voteCount}
                                </span>
                            ) : (
                                <Button
                                    size="small"
                                    variant={chosen ? "primary" : "outline"}
                                    disabled={voteMutation.isPending}
                                    onClick={() => voteMutation.mutate(option.id)}
                                >
                                    {t("polls.vote", "Vote")}
                                </Button>
                            )}
                        </div>
                        {hasVoted && (
                            <div
                                className={styles.barTrack}
                                role="progressbar"
                                aria-valuenow={pct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    className={reduced ? styles.barFillStatic : styles.barFill}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}

            <span className={styles.totalVotes}>
                {voteMutation.isPending && <Spinner size="tiny" />}
                {total} {total === 1 ? t("polls.voteSingular", "vote") : t("polls.votes", "votes")}
            </span>
        </div>
    );
}

/**
 * Ranking poll: user drags options into their preferred order, then submits.
 * Uses HTML5 drag-and-drop (no external lib).
 */
function RankingPoll({ poll, reduced }: { poll: Poll; reduced: boolean }) {
    const { t } = useTranslation();
    const [order, setOrder] = useState<PollOption[]>(() => [...poll.options]);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleDragStart = (e: DragEvent<HTMLLIElement>, index: number) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };
    const handleDragOver = (e: DragEvent<HTMLLIElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };
    const handleDrop = (e: DragEvent<HTMLLIElement>, index: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        setOrder((prev) => {
            const next = [...prev];
            const [moved] = next.splice(dragIndex, 1);
            next.splice(index, 0, moved);
            return next;
        });
        setDragIndex(null);
    };

    return (
        <div className={styles.root}>
            <div className={styles.questionRow}>
                <span className={styles.question}>{poll.question}</span>
                <Badge variant="accent" size="small">
                    {t("polls.modeRanking", "Ranking")}
                </Badge>
            </div>
            <p className={styles.hint}>{t("polls.rankingHint", "Drag to reorder, then submit.")}</p>
            <ol className={styles.rankList}>
                {order.map((option, index) => (
                    <li
                        key={option.id}
                        className={
                            dragIndex === index ? styles.rankItemDragging : styles.rankItem
                        }
                        draggable={!submitted}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        <span className={styles.rankPosition}>{index + 1}</span>
                        <span className={styles.rankText}>{option.text}</span>
                        <span className={reduced ? styles.rankHandleStatic : styles.rankHandle} aria-hidden="true">
                            ::
                        </span>
                    </li>
                ))}
            </ol>
            {!submitted ? (
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => setSubmitted(true)}
                    disabled={order.length === 0}
                >
                    {t("polls.submitRanking", "Submit ranking")}
                </Button>
            ) : (
                <MessageBar intent="success">
                    <MessageBarBody>
                        {t("polls.rankingSubmitted", "Your ranking was submitted.")}
                    </MessageBarBody>
                </MessageBar>
            )}
        </div>
    );
}

/**
 * Open-ended poll: user submits a free-text response.
 */
function OpenEndedPoll({ poll, reduced: _reduced }: { poll: Poll; reduced: boolean }) {
    const { t } = useTranslation();
    const [text, setText] = useState("");
    const [submitted, setSubmitted] = useState(false);

    return (
        <div className={styles.root}>
            <div className={styles.questionRow}>
                <span className={styles.question}>{poll.question}</span>
                <Badge variant="accent" size="small">
                    {t("polls.modeOpenEnded", "Open-ended")}
                </Badge>
            </div>
            {!submitted ? (
                <div className={styles.openEndedRow}>
                    <textarea
                        className={styles.textArea}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t("polls.openEndedPlaceholder", "Type your answer...")}
                        rows={3}
                    />
                    <Button
                        variant="primary"
                        size="small"
                        onClick={() => setSubmitted(true)}
                        disabled={!text.trim()}
                    >
                        {t("polls.submitAnswer", "Submit answer")}
                    </Button>
                </div>
            ) : (
                <MessageBar intent="success">
                    <MessageBarBody>
                        {t("polls.answerSubmitted", "Your answer was submitted.")}
                    </MessageBarBody>
                </MessageBar>
            )}
        </div>
    );
}

export default PollDisplay;
