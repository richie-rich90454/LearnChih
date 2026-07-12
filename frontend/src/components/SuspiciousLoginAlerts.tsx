import { Warning24Regular, CheckmarkCircle24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useSuspiciousLoginStore } from "@/store/suspiciousLoginStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./SuspiciousLoginAlerts.module.css";

export default function SuspiciousLoginAlerts() {
    const { t } = useTranslation();
    const alerts = useSuspiciousLoginStore((s) => s.alerts);
    const resolveAlert = useSuspiciousLoginStore((s) => s.resolveAlert);

    if (alerts.length === 0) {
        return (
            <p className={styles.empty}>
                {t("suspiciousLogins.noAlerts", "No suspicious login alerts.")}
            </p>
        );
    }

    return (
        <ul className={styles.list}>
            {alerts.map((alert) => (
                <li key={alert.id}>
                    <Card padding="md" className={styles.alertCard}>
                        <div className={styles.alertHead}>
                            <span className={styles.alertIcon} aria-hidden="true">
                                {alert.resolved ? (
                                    <CheckmarkCircle24Regular />
                                ) : (
                                    <Warning24Regular />
                                )}
                            </span>
                            <span className={styles.userName}>{alert.userName}</span>
                            <Badge
                                variant={alert.resolved ? "success" : "warning"}
                                size="small"
                            >
                                {alert.resolved
                                    ? t("suspiciousLogins.resolved", "Resolved")
                                    : t("suspiciousLogins.unresolved", "Unresolved")}
                            </Badge>
                            {!alert.resolved && (
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={() => resolveAlert(alert.id)}
                                    className={styles.resolveBtn}
                                >
                                    {t("suspiciousLogins.resolve", "Resolve")}
                                </Button>
                            )}
                        </div>
                        <div className={styles.alertDetails}>
                            <span>
                                {t("suspiciousLogins.ip", "IP")}: {alert.ipAddress}
                            </span>
                            <span>
                                {t("suspiciousLogins.location", "Location")}: {alert.location}
                            </span>
                            <span>
                                {t("suspiciousLogins.reason", "Reason")}: {alert.reason}
                            </span>
                            <span>
                                {t("suspiciousLogins.time", "Time")}:{" "}
                                {new Date(alert.timestamp).toLocaleString()}
                            </span>
                        </div>
                    </Card>
                </li>
            ))}
        </ul>
    );
}
