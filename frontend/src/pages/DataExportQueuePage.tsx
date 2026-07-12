import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { CloudArrowDown24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import DataExportQueue from "@/components/DataExportQueue";
import styles from "./AdminDashboardPage.module.css";

export default function DataExportQueuePage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("dataExportQueue.title", "Data exports")} — LernChih`}
                    canonicalPath="/admin/data-exports"
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
                title={`${t("dataExportQueue.title", "Data exports")} — LernChih`}
                canonicalPath="/admin/data-exports"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <CloudArrowDown24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("dataExportQueue.title", "Data exports")}
                </h1>
            </header>
            <DataExportQueue />
        </div>
    );
}
