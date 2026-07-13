import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import {
    Card,
    Button,
    Switch,
    Body1,
    Link,
    Subtitle2,
} from "@fluentui/react-components";
import useCookieConsentStore from "../store/cookieConsentStore";
import styles from "./CookieConsent.module.css";

export default function CookieConsent() {
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
                                rel="noopener noreferrer"
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
