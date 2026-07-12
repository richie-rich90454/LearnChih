import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Link, Text } from "@fluentui/react-components";
import { LogoMono } from "@/components/Logo";
import useCookieConsentStore from "@/store/cookieConsentStore";
import styles from "./Footer.module.css";

/*
 * Sidebar divider spacing convention (B62): The app sidebar's divider
 * spacing is owned by `components/AppLayout.module.css` (not owned here).
 * Dividers between sidebar sections should use `var(--space-4)` padding
 * above/below and a `--border-subtle` hairline so they match the vertical
 * rhythm documented in Card.module.css (B57). This footer is documented
 * here as the layout-adjacent surface that shares the same rhythm tokens.
 */
export default function Footer() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const resetConsent = useCookieConsentStore((s) => s.reset);

    return (
        <footer className={styles.footer}>
            {/* Brand */}
            <div className={styles.brandColumn}>
                <LogoMono size={20} />
                <Text className={styles.tagline}>{t("footer.tagline")}</Text>
            </div>

            {/* Links */}
            <nav className={styles.linkColumn} aria-label={t("a11y.footerNavigation")}>
                <Link className={styles.link} onClick={() => navigate("/resources")}>{t("nav.resources")}</Link>
                <Link className={styles.link} onClick={() => navigate("/channels")}>{t("nav.channels")}</Link>
                <Link className={styles.link} onClick={() => navigate("/api-docs")}>{t("footer.apiDocs")}</Link>
                <Link className={styles.link} href="/api/feeds/rss" target="_blank" rel="noopener noreferrer">
                    {t("footer.rss")}
                </Link>
                <Link className={styles.link} href="/api/feeds/atom" target="_blank" rel="noopener noreferrer">
                    {t("footer.atom")}
                </Link>
                <Link className={styles.link} onClick={() => navigate("/privacy")}>{t("footer.privacy")}</Link>
                <Link className={styles.link} onClick={() => navigate("/terms")}>{t("footer.terms")}</Link>
                <Link className={styles.link} onClick={() => resetConsent()}>{t("footer.cookiePreferences")}</Link>
            </nav>

            {/* Copyright */}
            <Text className={styles.copyright}>{t("footer.copyright")}</Text>
        </footer>
    );
}
