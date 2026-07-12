import { useState } from "react";
import {
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    Button,
    Tooltip,
} from "@fluentui/react-components";
import {
    Warning24Regular,
    Info24Regular,
    ErrorCircle24Regular,
    Dismiss24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import type { MaintenanceBannerConfig } from "@/api/systemSettings";
import { useMaintenanceBanner } from "@/hooks/useSystemSettings";
import styles from "./MaintenanceBanner.module.css";

type BannerLevel = "info" | "warning" | "error";

function parseConfig(settingValue: string | null): MaintenanceBannerConfig | null {
    if (!settingValue) return null;
    try {
        const parsed = JSON.parse(settingValue) as Partial<MaintenanceBannerConfig>;
        if (
            typeof parsed.enabled !== "boolean" ||
            typeof parsed.message !== "string" ||
            !parsed.level
        ) {
            return null;
        }
        return {
            enabled: parsed.enabled,
            message: parsed.message,
            level: parsed.level as BannerLevel,
        };
    } catch {
        return null;
    }
}

function levelIcon(level: BannerLevel) {
    if (level === "error") return <ErrorCircle24Regular />;
    if (level === "warning") return <Warning24Regular />;
    return <Info24Regular />;
}

/**
 * Site-wide maintenance banner. Mounted at the app root so it appears above
 * all content. Reads the `maintenance_banner` system setting (a JSON string
 * with `enabled`, `message`, and `level` fields) and renders a MessageBar
 * when the banner is enabled and has a non-empty message.
 *
 * The banner is dismissable per session via local state — dismissing hides
 * it until the page is refreshed, so the maintenance notice resurfaces on
 * the next visit.
 */
export function MaintenanceBanner() {
    const { t } = useTranslation();
    const [dismissed, setDismissed] = useState(false);
    const { data } = useMaintenanceBanner();

    if (dismissed) return null;

    const config = parseConfig(data?.settingValue ?? null);
    if (!config || !config.enabled || !config.message.trim()) return null;

    return (
        <div className={styles.bannerWrap} role="status" aria-live="polite">
            <MessageBar
                intent={config.level}
                className={styles.messageBar}
                layout="multiline"
            >
                <MessageBarBody>
                    <MessageBarTitle>{t("maintenanceBanner.title")}</MessageBarTitle>
                    {config.message}
                </MessageBarBody>
                <Tooltip content={t("maintenanceBanner.dismiss")} relationship="label">
                    <Button
                        appearance="subtle"
                        size="small"
                        icon={<Dismiss24Regular />}
                        onClick={() => setDismissed(true)}
                        aria-label={t("maintenanceBanner.dismiss")}
                    />
                </Tooltip>
            </MessageBar>
        </div>
    );
}
