import { useState } from "react";
import { Spinner } from "@fluentui/react-components";
import {
    Database24Regular,
    ArrowClockwise24Regular,
    CheckmarkCircle24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./BackupStatus.module.css";

export default function BackupStatus() {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const [triggering, setTriggering] = useState(false);
    const [lastBackup, setLastBackup] = useState(
        new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    );

    const nextScheduled = new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString();
    const restoreInProgress = false;

    const handleTrigger = () => {
        setTriggering(true);
        window.setTimeout(() => {
            setLastBackup(new Date().toISOString());
            setTriggering(false);
        }, 800);
    };

    return (
        <Card padding="lg" className={styles.panel}>
            <div className={styles.head}>
                <span className={styles.icon} aria-hidden="true">
                    <Database24Regular />
                </span>
                <h2 className={styles.title}>
                    {t("backupStatus.title", "Backup & restore status")}
                </h2>
            </div>

            {restoreInProgress && (
                <div className={styles.restoreRow} role="status">
                    <Spinner size="tiny" />
                    <span>
                        {t("backupStatus.restoreInProgress", "Restore in progress...")}
                    </span>
                </div>
            )}

            <ul className={styles.metrics}>
                <li className={styles.metricRow}>
                    <span className={styles.metricLabel}>
                        {t("backupStatus.lastBackup", "Last backup")}
                    </span>
                    <span className={styles.metricValue}>
                        {new Date(lastBackup).toLocaleString()}
                    </span>
                    <Badge variant="success" size="small" icon={<CheckmarkCircle24Regular />}>
                        {t("backupStatus.ok", "OK")}
                    </Badge>
                </li>
                <li className={styles.metricRow}>
                    <span className={styles.metricLabel}>
                        {t("backupStatus.nextScheduled", "Next scheduled")}
                    </span>
                    <span className={styles.metricValue}>
                        {new Date(nextScheduled).toLocaleString()}
                    </span>
                </li>
                <li className={styles.metricRow}>
                    <span className={styles.metricLabel}>
                        {t("backupStatus.backupSize", "Backup size")}
                    </span>
                    <span className={styles.metricValue}>1.2 GB</span>
                </li>
                <li className={styles.metricRow}>
                    <span className={styles.metricLabel}>
                        {t("backupStatus.location", "Storage location")}
                    </span>
                    <span className={styles.metricValue}>s3://lernchih-backups</span>
                </li>
            </ul>

            <Button
                variant="primary"
                icon={triggering ? undefined : <ArrowClockwise24Regular />}
                onClick={handleTrigger}
                disabled={triggering}
                className={styles.trigger}
                style={reduced ? { transitionDuration: "0ms" } : undefined}
            >
                {triggering ? (
                    <Spinner size="tiny" />
                ) : (
                    t("backupStatus.triggerNow", "Trigger backup now")
                )}
            </Button>
        </Card>
    );
}
