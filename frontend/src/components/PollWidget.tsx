import { useTranslation } from "react-i18next";
import { Card } from "./ui/Card";
import { PollDisplay, type Poll, type PollMode } from "./PollDisplay";
import styles from "./PollWidget.module.css";

interface PollWidgetProps {
    pollId?: number;
    mode?: PollMode;
    poll?: Poll;
}

const DEMO_POLL: Poll = {
    id: 0,
    question: "Which topic should we cover next?",
    options: [
        { id: 1, text: "Algebra fundamentals", voteCount: 4 },
        { id: 2, text: "Geometry applications", voteCount: 2 },
        { id: 3, text: "Calculus intro", voteCount: 3 },
    ],
    totalVotes: 9,
};

/**
 * Poll widget embedding a configurable PollDisplay (F46). Renders the
 * single-choice, ranking, or open-ended variant based on the `mode` prop.
 *
 * Spec refs: F1.8-F1.12, F46.
 */
export function PollWidget({ pollId, mode = "single", poll }: PollWidgetProps) {
    const { t } = useTranslation();
    const resolved: Poll = poll ?? { ...DEMO_POLL, id: pollId ?? DEMO_POLL.id };
    return (
        <Card padding="md" className={styles.root}>
            <span className={styles.label}>
                {t("polls.widgetTitle", "Poll")}
            </span>
            <PollDisplay poll={resolved} mode={mode} />
        </Card>
    );
}

export default PollWidget;
