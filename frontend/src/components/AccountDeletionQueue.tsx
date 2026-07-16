import { useState } from "react";
import {
    PersonDelete24Regular,
    Dismiss24Regular,
    Add24Regular,
    Clock24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    useAccountDeletionStore,
    DEFAULT_DELETION_GRACE_DAYS,
    type DeletionRequest,
} from "@/store/accountDeletionStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import styles from "./AccountDeletionQueue.module.css";

function formatCountdown(scheduledFor: string): { text: string; overdue: boolean } {
    const diff = new Date(scheduledFor).getTime() - Date.now();
    if (diff <= 0) return { text: "Due now", overdue: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return { text: `${days}d ${hours}h`, overdue: false };
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `${hours}h ${minutes}m`, overdue: false };
}

function RequestRow({ request }: { request: DeletionRequest }) {
    const { t } = useTranslation();
    const cancelDeletion = useAccountDeletionStore((s) => s.cancelDeletion);
    const countdown = formatCountdown(request.scheduledFor);

    return (
        <Card padding="md" className={styles.requestCard}>
            <div className={styles.requestHead}>
                <span className={styles.userName}>{request.userName}</span>
                <span className={styles.email}>{request.email}</span>
                {request.cancelled ? (
                    <Badge variant="neutral" size="small">
                        {t("accountDeletion.cancelled", "Cancelled")}
                    </Badge>
                ) : (
                    <Badge variant={countdown.overdue ? "danger" : "warning"} size="small">
                        {t("accountDeletion.pending", "Pending")}
                    </Badge>
                )}
            </div>
            <div className={styles.requestDetails}>
                <span>
                    {t("accountDeletion.requestedAt", "Requested")}:{" "}
                    {new Date(request.requestedAt).toLocaleDateString()}
                </span>
                <span>
                    {t("accountDeletion.scheduledFor", "Scheduled")}:{" "}
                    {new Date(request.scheduledFor).toLocaleDateString()}
                </span>
                <span className={countdown.overdue ? styles.countdownOverdue : styles.countdown}>
                    <Clock24Regular className={styles.clockIcon} />
                    {t("accountDeletion.timeRemaining", "Time remaining")}: {countdown.text}
                </span>
            </div>
            {!request.cancelled && (
                <Button
                    variant="outline"
                    size="small"
                    icon={<Dismiss24Regular />}
                    onClick={() => cancelDeletion(request.id)}
                >
                    {t("accountDeletion.cancelDeletion", "Cancel deletion")}
                </Button>
            )}
        </Card>
    );
}

export default function AccountDeletionQueue() {
    const { t } = useTranslation();
    const requests = useAccountDeletionStore((s) => s.deletionRequests);
    const requestDeletion = useAccountDeletionStore((s) => s.requestDeletion);
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [graceDays, setGraceDays] = useState(String(DEFAULT_DELETION_GRACE_DAYS));

    const handleRequest = () => {
        const id = Number(userId);
        if (!id || !userName.trim() || !email.trim()) return;
        requestDeletion(id, userName.trim(), email.trim(), Number(graceDays) || DEFAULT_DELETION_GRACE_DAYS);
        setUserId("");
        setUserName("");
        setEmail("");
    };

    return (
        <div className={styles.page}>
            <Card padding="md" className={styles.addCard}>
                <div className={styles.addForm}>
                    <Input
                        label={t("accountDeletion.userId", "User ID")}
                        type="number"
                        value={userId}
                        onChange={(_, d) => setUserId(d.value)}
                    />
                    <Input
                        label={t("accountDeletion.userName", "User name")}
                        value={userName}
                        onChange={(_, d) => setUserName(d.value)}
                    />
                    <Input
                        label={t("accountDeletion.email", "Email")}
                        type="email"
                        autoComplete="off"
                        value={email}
                        onChange={(_, d) => setEmail(d.value)}
                    />
                    <Input
                        label={t("accountDeletion.graceDays", "Grace (days)")}
                        type="number"
                        value={graceDays}
                        onChange={(_, d) => setGraceDays(d.value)}
                    />
                    <Button
                        variant="primary"
                        icon={<Add24Regular />}
                        onClick={handleRequest}
                        disabled={!userId || !userName.trim() || !email.trim()}
                    >
                        {t("accountDeletion.request", "Request deletion")}
                    </Button>
                </div>
            </Card>

            {requests.length === 0 ? (
                <p className={styles.empty}>
                    {t("accountDeletion.noRequests", "No deletion requests.")}
                </p>
            ) : (
                <ul className={styles.requestList}>
                    {requests.map((request) => (
                        <li key={request.id}>
                            <RequestRow request={request} />
                        </li>
                    ))}
                </ul>
            )}

            <div className={styles.hint}>
                <PersonDelete24Regular className={styles.hintIcon} />
                <span>
                    {t(
                        "accountDeletion.hint",
                        "Account deletion requests enter a grace period before permanent deletion. Admins can cancel before the scheduled date.",
                    )}
                </span>
            </div>
        </div>
    );
}
