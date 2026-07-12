import { Laptop24Regular, Phone24Regular, Tablet24Regular, Delete24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "@/store/sessionStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./SessionManager.module.css";

function DeviceIcon({ device }: { device: string }) {
    const lower = device.toLowerCase();
    if (lower.includes("iphone") || lower.includes("phone") || lower.includes("android")) {
        return <Phone24Regular />;
    }
    if (lower.includes("ipad") || lower.includes("tablet")) {
        return <Tablet24Regular />;
    }
    return <Laptop24Regular />;
}

export default function SessionManager() {
    const { t } = useTranslation();
    const sessions = useSessionStore((s) => s.sessions);
    const revoke = useSessionStore((s) => s.revoke);
    const revokeOthers = useSessionStore((s) => s.revokeOthers);

    const otherCount = sessions.filter((s) => !s.current).length;

    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <Button
                    variant="outline"
                    icon={<Delete24Regular />}
                    onClick={revokeOthers}
                    disabled={otherCount === 0}
                >
                    {t("sessionManagement.revokeOthers", "Revoke all other sessions")}
                </Button>
            </div>

            {sessions.length === 0 ? (
                <p className={styles.empty}>
                    {t("sessionManagement.noSessions", "No active sessions.")}
                </p>
            ) : (
                <ul className={styles.list}>
                    {sessions.map((session) => (
                        <li key={session.id}>
                            <Card padding="md" className={styles.sessionCard}>
                                <div className={styles.sessionHead}>
                                    <span className={styles.deviceIcon} aria-hidden="true">
                                        <DeviceIcon device={session.device} />
                                    </span>
                                    <div className={styles.meta}>
                                        <span className={styles.device}>
                                            {session.device}
                                        </span>
                                        {session.current && (
                                            <Badge variant="accent" size="small">
                                                {t("sessionManagement.current", "Current")}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Delete24Regular />}
                                        onClick={() => revoke(session.id)}
                                        disabled={session.current}
                                        aria-label={t("sessionManagement.revokeAria", "Revoke session")}
                                    >
                                        {t("sessionManagement.revoke", "Revoke")}
                                    </Button>
                                </div>
                                <div className={styles.sessionDetails}>
                                    <span>
                                        {t("sessionManagement.browser", "Browser")}:{" "}
                                        {session.browser}
                                    </span>
                                    <span>
                                        {t("sessionManagement.ip", "IP")}:{" "}
                                        {session.ipAddress}
                                    </span>
                                    <span>
                                        {t("sessionManagement.lastActive", "Last active")}:{" "}
                                        {new Date(session.lastActive).toLocaleString()}
                                    </span>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
