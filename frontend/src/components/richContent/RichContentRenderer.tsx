import { makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        lineHeight: "var(--line-height-relaxed)",
        color: tokens.colorNeutralForeground1,
        "& img": { maxWidth: "100%", height: "auto", borderRadius: tokens.borderRadiusMedium },
        "& a": { color: tokens.colorBrandForegroundLink },
        "& pre": {
            padding: tokens.spacingHorizontalM,
            background: tokens.colorNeutralBackground2,
            border: `1px solid ${tokens.colorNeutralStroke1}`,
            borderRadius: tokens.borderRadiusMedium,
            overflowX: "auto",
        },
        "& code": {
            fontFamily: tokens.fontFamilyMonospace,
            fontSize: "var(--fontSizeBase200)",
        },
        "& blockquote": {
            marginInlineStart: 0,
            paddingInlineStart: tokens.spacingHorizontalM,
            borderInlineStartWidth: "3px",
            borderInlineStartStyle: "solid",
            borderInlineStartColor: tokens.colorBrandStroke1,
            color: tokens.colorNeutralForeground3,
        },
        // F55: spoiler / collapsible sections rendered by the server as
        // native <details>/<summary> elements get branded styling.
        "& details": {
            marginBlock: tokens.spacingHorizontalM,
            padding: 0,
            border: `1px solid ${tokens.colorNeutralStroke1}`,
            borderRadius: tokens.borderRadiusMedium,
            background: tokens.colorNeutralBackground2,
            overflow: "hidden",
        },
        "& summary": {
            display: "flex",
            alignItems: "center",
            gap: tokens.spacingHorizontalXS,
            padding: `${tokens.spacingHorizontalXS} ${tokens.spacingHorizontalM}`,
            cursor: "pointer",
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            listStyle: "none",
        },
        "& summary::-webkit-details-marker": {
            display: "none",
        },
        "& summary:hover": {
            background: tokens.colorNeutralBackground1,
        },
        "& details > *:not(summary)": {
            padding: tokens.spacingHorizontalM,
            borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        },
    },
});

interface RichContentRendererProps {
    /** Sanitized HTML returned by the server. */
    html: string;
    className?: string;
}

/**
 * Renders rich content that the server has already sanitized via OWASP
 * HtmlSanitizer. Because the server is the trust boundary, we render the
 * HTML directly here.
 *
 * Spec refs: F1.7.
 */
export function RichContentRenderer({ html, className }: RichContentRendererProps) {
    const styles = useStyles();
    return (
        <div
            className={`${styles.root} ${className ?? ""}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export default RichContentRenderer;
