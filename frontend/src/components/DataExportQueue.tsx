import { useState } from "react";
import {
    ArrowDownload24Regular,
    Play24Regular,
    CheckmarkCircle24Regular,
    DismissCircle24Regular,
    Add24Regular,
    CloudArrowDown24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    useDataExportQueueStore,
    type ExportJob,
    type ExportJobStatus,
} from "@/store/dataExportQueueStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import styles from "./DataExportQueue.module.css";

function statusVariant(status: ExportJobStatus): BadgeVariant {
    switch (status) {
        case "completed":
            return "success";
        case "processing":
            return "accent";
        case "failed":
            return "danger";
        default:
            return "neutral";
    }
}

function formatSize(bytes?: number): string {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function JobRow({ job }: { job: ExportJob }) {
    const { t } = useTranslation();
    const markProcessing = useDataExportQueueStore((s) => s.markProcessing);
    const markCompleted = useDataExportQueueStore((s) => s.markCompleted);
    const markFailed = useDataExportQueueStore((s) => s.markFailed);

    return (
        <Card padding="md" className={styles.jobCard}>
            <div className={styles.jobHead}>
                <span className={styles.jobUser}>{job.userName}</span>
                <span className={styles.jobUserId}>#{job.userId}</span>
                <Badge variant={statusVariant(job.status)} size="small">
                    {t(`dataExportQueue.status.${job.status}`, job.status)}
                </Badge>
            </div>
            <div className={styles.jobDetails}>
                <span>
                    {t("dataExportQueue.requestedAt", "Requested")}:{" "}
                    {new Date(job.requestedAt).toLocaleString()}
                </span>
                <span>
                    {t("dataExportQueue.size", "Size")}: {formatSize(job.size)}
                </span>
            </div>
            <div className={styles.jobActions}>
                {job.status === "queued" && (
                    <Button
                        variant="outline"
                        size="small"
                        icon={<Play24Regular />}
                        onClick={() => markProcessing(job.id)}
                    >
                        {t("dataExportQueue.process", "Process")}
                    </Button>
                )}
                {job.status === "processing" && (
                    <>
                        <Button
                            variant="outline"
                            size="small"
                            icon={<CheckmarkCircle24Regular />}
                            onClick={() =>
                                markCompleted(job.id, `/exports/${job.userName}_gdpr.zip`, 3_200_000)
                            }
                        >
                            {t("dataExportQueue.markComplete", "Mark complete")}
                        </Button>
                        <Button
                            variant="subtle"
                            size="small"
                            icon={<DismissCircle24Regular />}
                            onClick={() => markFailed(job.id)}
                        >
                            {t("dataExportQueue.markFailed", "Mark failed")}
                        </Button>
                    </>
                )}
                {job.status === "completed" && job.downloadUrl && (
                    <Button
                        variant="primary"
                        size="small"
                        icon={<ArrowDownload24Regular />}
                        onClick={() => window.open(job.downloadUrl, "_blank")}
                    >
                        {t("dataExportQueue.download", "Download")}
                    </Button>
                )}
            </div>
        </Card>
    );
}

export default function DataExportQueue() {
    const { t } = useTranslation();
    const jobs = useDataExportQueueStore((s) => s.jobs);
    const enqueue = useDataExportQueueStore((s) => s.enqueue);
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");

    const handleEnqueue = () => {
        const id = Number(userId);
        if (!id || !userName.trim()) return;
        enqueue(id, userName.trim());
        setUserId("");
        setUserName("");
    };

    return (
        <div className={styles.page}>
            <Card padding="md" className={styles.addCard}>
                <div className={styles.addForm}>
                    <Input
                        label={t("dataExportQueue.userId", "User ID")}
                        type="number"
                        value={userId}
                        onChange={(_, d) => setUserId(d.value)}
                    />
                    <Input
                        label={t("dataExportQueue.userName", "User name")}
                        value={userName}
                        onChange={(_, d) => setUserName(d.value)}
                    />
                    <Button
                        variant="primary"
                        icon={<Add24Regular />}
                        onClick={handleEnqueue}
                        disabled={!userId || !userName.trim()}
                    >
                        {t("dataExportQueue.enqueue", "Enqueue export")}
                    </Button>
                </div>
            </Card>

            {jobs.length === 0 ? (
                <p className={styles.empty}>
                    {t("dataExportQueue.noJobs", "No export jobs.")}
                </p>
            ) : (
                <ul className={styles.jobList}>
                    {jobs.map((job) => (
                        <li key={job.id}>
                            <JobRow job={job} />
                        </li>
                    ))}
                </ul>
            )}

            <div className={styles.hint}>
                <CloudArrowDown24Regular className={styles.hintIcon} />
                <span>
                    {t(
                        "dataExportQueue.gdprHint",
                        "GDPR bulk export jobs. Completed exports are available for download for 30 days.",
                    )}
                </span>
            </div>
        </div>
    );
}
