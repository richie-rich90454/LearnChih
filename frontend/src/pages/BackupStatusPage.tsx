import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { Database24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import BackupStatus from "@/components/BackupStatus";
import styles from "./AdminDashboardPage.module.css";

export default function BackupStatusPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("backupStatus.title", "Backup & restore status")} — LernChih`}
                    canonicalPath="/admin/backups"
                    robots="noindex, nofollow"
                />
                <MessageBar intent="error">
                    <MessageBarBody>{t("admin.permissionDenied")}</MessageBarBody>
                </MessageBar>
            </>
        );
    }

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("backupStatus.title", "Backup & restore status")} — LernChih`}
                canonicalPath="/admin/backups"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Database24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("backupStatus.title", "Backup & restore status")}
                </h1>
            </header>
            <BackupStatus />
        </div>
    );
}
