import { useEffect, useState } from "react";
import { ArrowDownload24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import styles from "./InstallPrompt.module.css";

const DISMISSED_KEY = "lernchih-install-dismissed";
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Minimal shape of the `beforeinstallprompt` event. The full DOM type is not
 * in lib.dom.d.ts, so we declare just the members we call.
 */
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosSafari(): boolean {
    if (typeof navigator === "undefined" || typeof window === "undefined") {
        return false;
    }
    const ua = navigator.userAgent || "";
    const ios = /iPad|iPhone|iPod/.test(ua);
    // iPadOS 13+ reports as Mac desktop; detect via touch + Mac.
    const ipadOnIos13 =
        /Macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1;
    return (ios || ipadOnIos13) && !("MSStream" in window);
}

function isRecentlyDismissed(): boolean {
    try {
        const raw = localStorage.getItem(DISMISSED_KEY);
        if (!raw) return false;
        const ts = Number(raw);
        if (!Number.isFinite(ts)) return false;
        return Date.now() - ts < DISMISS_TTL_MS;
    } catch {
        return false;
    }
}

function markDismissed(): void {
    try {
        localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
        // ignore storage errors (e.g. private mode quota)
    }
}

/**
 * PWA install prompt banner (F81). Captures the `beforeinstallprompt` event
 * (preventDefault) and shows a dismissible banner card at the bottom of the
 * screen. "Install" triggers the native prompt; "Maybe later" dismisses for
 * 14 days (timestamp persisted in localStorage). Skipped entirely on iOS
 * Safari, which never fires `beforeinstallprompt` (v1: no Add-to-Home-Screen
 * hint). Slide-in is omitted under prefers-reduced-motion.
 *
 * Spec ref: F81.
 */
export function InstallPrompt() {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
        null,
    );

    useEffect(() => {
        // iOS Safari never fires beforeinstallprompt; skip for v1.
        if (isIosSafari()) return;
        // Respect a recent dismissal for the lifetime of this tab too.
        if (isRecentlyDismissed()) return;

        const onBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferred(e as BeforeInstallPromptEvent);
        };
        window.addEventListener(
            "beforeinstallprompt",
            onBeforeInstallPrompt as EventListener,
        );
        return () =>
            window.removeEventListener(
                "beforeinstallprompt",
                onBeforeInstallPrompt as EventListener,
            );
    }, []);

    // Clear the captured prompt once the browser fires appinstalled.
    useEffect(() => {
        const onInstalled = () => setDeferred(null);
        window.addEventListener("appinstalled", onInstalled);
        return () => window.removeEventListener("appinstalled", onInstalled);
    }, []);

    if (!deferred) return null;

    const handleInstall = async () => {
        try {
            await deferred.prompt();
            await deferred.userChoice;
        } catch {
            // Some browsers throw if prompt() is called twice; ignore.
        }
        setDeferred(null);
    };

    const handleLater = () => {
        markDismissed();
        setDeferred(null);
    };

    return (
        <Card
            padding="md"
            className={`${styles.banner} ${reduced ? "" : styles.slideIn}`}
            role="region"
            aria-label={t("pwa.installTitle")}
        >
            <span className={styles.icon} aria-hidden="true">
                <ArrowDownload24Regular />
            </span>
            <div className={styles.body}>
                <p className={styles.title}>{t("pwa.installTitle")}</p>
                <p className={styles.text}>{t("pwa.installBody")}</p>
            </div>
            <div className={styles.actions}>
                <Button variant="primary" size="small" onClick={handleInstall}>
                    {t("pwa.install")}
                </Button>
                <Button
                    variant="ghost"
                    size="small"
                    icon={<Dismiss24Regular />}
                    onClick={handleLater}
                    aria-label={t("pwa.maybeLater")}
                >
                    {t("pwa.maybeLater")}
                </Button>
            </div>
        </Card>
    );
}

export default InstallPrompt;
