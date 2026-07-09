import { useTranslation } from "react-i18next";
import { useThreadSubscription, useUpdateThreadSubscription } from "@/hooks/useThreadSubscriptions";
import type { DigestFrequency } from "@/api/threadSubscriptions";
import { Select, Option } from "@/components/ui/Select";
import { Spinner } from "@fluentui/react-components";
import styles from "./ThreadSubscription.module.css";

interface ThreadSubscriptionProps {
    threadId: number;
}

const FREQUENCIES: DigestFrequency[] = ["NONE", "INSTANT", "DAILY", "WEEKLY"];

/**
 * A dropdown that lets the user pick how often they receive a digest of new
 * posts for a thread (F33). Renders inline next to thread actions.
 */
export function ThreadSubscription({ threadId }: ThreadSubscriptionProps) {
    const { t } = useTranslation();
    const { data, isLoading } = useThreadSubscription(threadId);
    const update = useUpdateThreadSubscription(threadId);

    const current: DigestFrequency = data?.frequency ?? "NONE";

    const handleChange = (value: DigestFrequency) => {
        update.mutate(value);
    };

    if (isLoading) {
        return <Spinner size="tiny" />;
    }

    return (
        <div className={styles.wrapper}>
            <span className={styles.label} id={`sub-label-${threadId}`}>
                {t("threadSubscription.label")}
            </span>
            <Select
                aria-labelledby={`sub-label-${threadId}`}
                value={current}
                onChange={(_e, data) => handleChange(data.value as DigestFrequency)}
                disabled={update.isPending}
            >
                {FREQUENCIES.map((f) => (
                    <Option key={f} value={f}>
                        {t(`threadSubscription.frequencies.${f}`)}
                    </Option>
                ))}
            </Select>
        </div>
    );
}

export default ThreadSubscription;
