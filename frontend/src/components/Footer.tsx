import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { makeStyles, tokens, Link, Text } from "@fluentui/react-components";
import { LogoMono } from "@/components/Logo";
import useCookieConsentStore from "@/store/cookieConsentStore";

const useStyles = makeStyles({
    footer: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
        padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
    },
    columns: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: tokens.spacingHorizontalXL,
        "@media (max-width: 768px)": {
            gridTemplateColumns: "1fr",
            gap: tokens.spacingVerticalM,
        },
    },
    brandColumn: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
        maxWidth: "220px",
    },
    tagline: {
        color: tokens.colorNeutralForeground2,
        fontSize: tokens.fontSizeBase200,
    },
    linkColumn: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
        alignItems: "flex-start",
    },
    copyright: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
        paddingTop: tokens.spacingVerticalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },
});

export default function Footer() {
    const styles = useStyles();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const resetConsent = useCookieConsentStore((s) => s.reset);

    return (
        <footer className={styles.footer}>
            <div className={styles.columns}>
                {/* Brand column */}
                <div className={styles.brandColumn}>
                    <LogoMono size={24} />
                    <Text className={styles.tagline}>{t("footer.tagline")}</Text>
                </div>

                {/* Links column */}
                <nav className={styles.linkColumn} aria-label={t("a11y.footerNavigation")}>
                    <Link onClick={() => navigate("/resources")}>{t("nav.resources")}</Link>
                    <Link onClick={() => navigate("/channels")}>{t("nav.channels")}</Link>
                    <Link onClick={() => navigate("/api-docs")}>{t("footer.apiDocs")}</Link>
                    <Link href="/api/feeds/rss" target="_blank" rel="noopener noreferrer">
                        {t("footer.rss")}
                    </Link>
                    <Link href="/api/feeds/atom" target="_blank" rel="noopener noreferrer">
                        {t("footer.atom")}
                    </Link>
                </nav>

                {/* Legal column */}
                <nav className={styles.linkColumn} aria-label={t("footer.cookiePreferences")}>
                    <Link onClick={() => navigate("/privacy")}>{t("footer.privacy")}</Link>
                    <Link onClick={() => navigate("/terms")}>{t("footer.terms")}</Link>
                    <Link onClick={() => resetConsent()}>{t("footer.cookiePreferences")}</Link>
                </nav>
            </div>

            <Text className={styles.copyright}>{t("footer.copyright")}</Text>
        </footer>
    );
}
