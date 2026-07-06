import type { ReactNode } from "react";
import { makeStyles, tokens, Title3, Body1, Button } from "@fluentui/react-components";
import { ErrorCircle24Regular } from "@fluentui/react-icons";

export interface ErrorStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    onRetry?: () => void;
    retryLabel?: string;
}

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingTop: "64px",
        paddingBottom: "64px",
        paddingLeft: tokens.spacingHorizontalL,
        paddingRight: tokens.spacingHorizontalL,
        gap: tokens.spacingVerticalM,
    },
    iconWrapper: {
        color: tokens.colorPaletteRedForeground1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Render the passed icon at a consistent 48px regardless of the
        // *24Regular size baked into the icon component name.
        "& svg": {
            width: "48px",
            height: "48px",
        },
    },
    description: {
        color: tokens.colorNeutralForeground3,
        maxWidth: "480px",
    },
    action: {
        marginTop: tokens.spacingVerticalS,
    },
});

export function ErrorState({
    icon,
    title,
    description,
    onRetry,
    retryLabel = "Try again",
}: ErrorStateProps) {
    const styles = useStyles();
    return (
        <div className={styles.root} role="alert">
            <div className={styles.iconWrapper} aria-hidden="true">
                {icon ?? <ErrorCircle24Regular />}
            </div>
            <Title3 as="h2">{title}</Title3>
            <Body1 className={styles.description}>{description}</Body1>
            {onRetry && (
                <div className={styles.action}>
                    <Button appearance="primary" onClick={onRetry}>
                        {retryLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ErrorState;
