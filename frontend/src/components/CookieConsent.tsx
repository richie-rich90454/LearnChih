import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import {
    makeStyles,
    tokens,
    Card,
    Button,
    Switch,
    Body1,
    Link,
    Subtitle2,
} from "@fluentui/react-components";
import useCookieConsentStore from "../store/cookieConsentStore";

const useStyles = makeStyles({
    banner: {
        position: "fixed",
        bottom: tokens.spacingVerticalM,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "720px",
        zIndex: 1000,
        padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
        // Concrete background for axe-core; dark mode override.
        backgroundColor: "#FFFFFF",
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusLarge,
        boxShadow: tokens.shadow16,
        "@media (max-width: 768px)": {
            bottom: "0",
            left: "0",
            transform: "none",
            width: "100%",
            maxWidth: "100%",
            borderRadius: "0",
            borderLeft: "none",
            borderRight: "none",
            borderBottom: "none",
        },
        "@media (prefers-color-scheme: dark)": {
            backgroundColor: "#242424",
        },
    },
    content: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingHorizontalM,
    },
    header: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
    },
    actions: {
        display: "flex",
        flexWrap: "wrap",
        gap: tokens.spacingHorizontalS,
        marginTop: tokens.spacingVerticalXXS,
    },
    customizeSection: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
        paddingTop: tokens.spacingVerticalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    switchRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: tokens.spacingHorizontalL,
    },
    switchLabel: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXXS,
    },
    switchControl: {
        flexShrink: 0,
        marginTop: tokens.spacingVerticalXXS,
    },
    privacyLink: {
        textDecoration: "underline",
    },
});

export default function CookieConsent() {
    const styles = useStyles();
    // useSuspense: false keeps this component (rendered outside Suspense) from
    // throwing if i18n is not yet ready.
    const { t } = useTranslation("translation", { useSuspense: false });
    const hasResponded = useCookieConsentStore((s) => s.hasResponded);
    const setConsent = useCookieConsentStore((s) => s.setConsent);
    const [customized, setCustomized] = useState(false);
    const [functionalLocal, setFunctionalLocal] = useState(false);
    const [analyticsLocal, setAnalyticsLocal] = useState(false);

    if (hasResponded) {
        return null;
    }

    const handleAcceptAll = () => setConsent(true, true);
    const handleRejectAll = () => setConsent(false, false);
    const handleSaveCustomization = () => setConsent(functionalLocal, analyticsLocal);
    const handleToggleCustomize = () => setCustomized((prev) => !prev);

    return (
        <Card
            className={styles.banner}
            role="region"
            aria-label={t("cookieConsent.ariaLabel")}
            size="small"
            data-cookie-consent="true"
        >
            <div className={styles.content}>
                <div className={styles.header}>
                    <Subtitle2>{t("cookieConsent.title")}</Subtitle2>
                    <Body1>
                        <Trans i18nKey="cookieConsent.body">
                            We use cookies to keep the site working (necessary), enable extra
                            features (functional), and understand how you use the site (analytics).
                            Necessary cookies are always on. See our{" "}
                            <Link
                                href="#"
                                target="_blank"
                                rel="noreferrer"
                                className={styles.privacyLink}
                            >
                                privacy notice
                            </Link>
                            .
                        </Trans>
                    </Body1>
                </div>

                {customized && (
                    <div
                        id="cookie-customize"
                        className={styles.customizeSection}
                        role="group"
                        aria-label={t("cookieConsent.categoriesAriaLabel")}
                    >
                        <div className={styles.switchRow}>
                            <div className={styles.switchLabel}>
                                <Body1>
                                    <strong>{t("cookieConsent.necessary")}</strong>
                                </Body1>
                                <Body1>{t("cookieConsent.necessaryDescription")}</Body1>
                            </div>
                            <Switch
                                className={styles.switchControl}
                                checked
                                disabled
                                aria-label={t("cookieConsent.necessaryAriaLabel")}
                            />
                        </div>

                        <div className={styles.switchRow}>
                            <div className={styles.switchLabel}>
                                <Body1>
                                    <strong>{t("cookieConsent.functional")}</strong>
                                </Body1>
                                <Body1>{t("cookieConsent.functionalDescription")}</Body1>
                            </div>
                            <Switch
                                className={styles.switchControl}
                                checked={functionalLocal}
                                onChange={(_, data) => setFunctionalLocal(data.checked)}
                                aria-label={t("cookieConsent.functionalAriaLabel")}
                            />
                        </div>

                        <div className={styles.switchRow}>
                            <div className={styles.switchLabel}>
                                <Body1>
                                    <strong>{t("cookieConsent.analytics")}</strong>
                                </Body1>
                                <Body1>{t("cookieConsent.analyticsDescription")}</Body1>
                            </div>
                            <Switch
                                className={styles.switchControl}
                                checked={analyticsLocal}
                                onChange={(_, data) => setAnalyticsLocal(data.checked)}
                                aria-label={t("cookieConsent.analyticsAriaLabel")}
                            />
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <Button appearance="primary" onClick={handleAcceptAll}>
                        {t("cookieConsent.acceptAll")}
                    </Button>
                    <Button appearance="secondary" onClick={handleRejectAll}>
                        {t("cookieConsent.rejectAll")}
                    </Button>
                    <Button
                        appearance="subtle"
                        onClick={handleToggleCustomize}
                        aria-expanded={customized}
                        aria-controls="cookie-customize"
                    >
                        {customized ? t("cookieConsent.hideOptions") : t("cookieConsent.customize")}
                    </Button>
                    {customized && (
                        <Button appearance="primary" onClick={handleSaveCustomization}>
                            {t("cookieConsent.saveSelection")}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
