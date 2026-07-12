import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { PersonDelete24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import AccountDeletionQueue from "@/components/AccountDeletionQueue";
import styles from "./AdminDashboardPage.module.css";

export default function AccountDeletionQueuePage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("accountDeletion.title", "Account deletions")} — LernChih`}
                    canonicalPath="/admin/account-deletions"
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
                title={`${t("accountDeletion.title", "Account deletions")} — LernChih`}
                canonicalPath="/admin/account-deletions"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <PersonDelete24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("accountDeletion.title", "Account deletions")}
                </h1>
            </header>
            <AccountDeletionQueue />
        </div>
    );
}
