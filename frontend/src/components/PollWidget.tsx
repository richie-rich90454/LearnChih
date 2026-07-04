import { Body1, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        padding: tokens.spacingHorizontalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
    },
});

interface PollWidgetProps {
    pollId?: number;
}

/**
 * Stub widget for polls. The full PollDisplay / PollEditor components already
 * cover creation and voting; this widget is a placeholder for embedding a poll
 * in a thread preview or feed card.
 *
 * Spec refs: F1.8–F1.12.
 */
export function PollWidget({ pollId }: PollWidgetProps) {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <Body1>Poll #{pollId ?? "new"} — TODO: embed PollDisplay here.</Body1>
        </div>
    );
}

export default PollWidget;
