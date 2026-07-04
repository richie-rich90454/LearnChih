import { useTranslation } from "react-i18next";
import { makeStyles, tokens, Link, Text } from "@fluentui/react-components";

const useStyles = makeStyles({
    footer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: tokens.spacingHorizontalL,
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
        backgroundColor: tokens.colorNeutralBackground1,
        fontSize: tokens.fontSizeBase200,
    },
});

export default function Footer() {
    const styles = useStyles();
    const { t } = useTranslation();

    return (
        <footer className={styles.footer}>
            <Text size={200}>{t("footer.feeds")}</Text>
            <Link href="/api/feeds/rss" target="_blank" rel="noopener noreferrer">
                {t("footer.rss")}
            </Link>
            <Link href="/api/feeds/atom" target="_blank" rel="noopener noreferrer">
                {t("footer.atom")}
            </Link>
            <Link href="/api-docs">{t("footer.apiDocs")}</Link>
        </footer>
    );
}
