import type { ReactNode } from "react";
import { makeStyles, tokens, Title3, Body1 } from "@fluentui/react-components";

export interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
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
        color: tokens.colorBrandForeground1,
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

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    const styles = useStyles();
    return (
        <div className={styles.root} role="status">
            <div className={styles.iconWrapper} aria-hidden="true">
                {icon}
            </div>
            <Title3 as="h2">{title}</Title3>
            <Body1 className={styles.description}>{description}</Body1>
            {action && <div className={styles.action}>{action}</div>}
        </div>
    );
}

export default EmptyState;
