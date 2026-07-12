import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Popover,
    PopoverTrigger,
    PopoverSurface,
} from "@fluentui/react-components";
import { Clock24Regular, Snooze24Regular } from "@fluentui/react-icons";
import { useSnoozeStore } from "@/store/snoozeStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./SnoozeButton.module.css";

interface PresetOption {
    key: string;
    minutes: number;
    labelKey: string;
    defaultLabel: string;
}

/** Minutes from now until the next local midnight. */
function minutesUntilMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return Math.max(1, Math.round((tomorrow.getTime() - now.getTime()) / 60000));
}

/**
 * Snooze toggle for notifications. When not snoozed, opens a dropdown with
 * preset durations ("1 hour", "4 hours", "Until tomorrow") plus a custom
 * hours input. When snoozed, shows the expiry time with an Unsnooze action.
 * Auto-clears the store value when the snooze has expired.
 *
 * Spec ref: F79.
 */
export function SnoozeButton() {
    const { t } = useTranslation();
    const snoozedUntil = useSnoozeStore((s) => s.snoozedUntil);
    const snooze = useSnoozeStore((s) => s.snooze);
    const unsnooze = useSnoozeStore((s) => s.unsnooze);
    const [open, setOpen] = useState(false);
    const [customHours, setCustomHours] = useState("");

    const isSnoozed =
        snoozedUntil !== null && new Date(snoozedUntil).getTime() > Date.now();

    // Auto-clear: drop the stale value once the snooze has expired.
    useEffect(() => {
        if (snoozedUntil && new Date(snoozedUntil).getTime() <= Date.now()) {
            unsnooze();
        }
    }, [snoozedUntil, unsnooze]);

    const presets: PresetOption[] = [
        { key: "1h", minutes: 60, labelKey: "duration1h", defaultLabel: "1 hour" },
        { key: "4h", minutes: 240, labelKey: "duration4h", defaultLabel: "4 hours" },
        {
            key: "tomorrow",
            minutes: minutesUntilMidnight(),
            labelKey: "untilTomorrow",
            defaultLabel: "Until tomorrow",
        },
    ];

    const applySnooze = (minutes: number) => {
        snooze(minutes);
        setOpen(false);
    };

    const applyCustom = () => {
        const hours = Number(customHours);
        if (!Number.isFinite(hours) || hours <= 0) return;
        applySnooze(Math.round(hours * 60));
        setCustomHours("");
    };

    if (isSnoozed && snoozedUntil) {
        return (
            <span className={styles.activeIndicator}>
                <Clock24Regular />
                <span>
                    {t("snooze.snoozedUntil", "Snoozed until {{time}}", {
                        time: new Date(snoozedUntil).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    })}
                </span>
                <Button
                    variant="ghost"
                    size="small"
                    onClick={() => unsnooze()}
                    aria-label={t("snooze.unsnooze", "Unsnooze")}
                >
                    {t("snooze.unsnooze", "Unsnooze")}
                </Button>
            </span>
        );
    }

    return (
        <Popover open={open} onOpenChange={(_, data) => setOpen(data.open)}>
            <PopoverTrigger disableButtonEnhancement>
                <Button
                    variant="subtle"
                    size="small"
                    icon={<Snooze24Regular />}
                >
                    {t("snooze.snooze", "Snooze")}
                </Button>
            </PopoverTrigger>
            <PopoverSurface className={styles.panel}>
                {presets.map((opt) => (
                    <button
                        key={opt.key}
                        type="button"
                        className={styles.optionButton}
                        onClick={() => applySnooze(opt.minutes)}
                    >
                        {t(`snooze.${opt.labelKey}`, opt.defaultLabel)}
                    </button>
                ))}
                <div className={styles.customRow}>
                    <Input
                        type="number"
                        value={customHours}
                        onChange={(e) => setCustomHours(e.target.value)}
                        placeholder={t("snooze.custom", "Custom...")}
                        className={styles.customInput}
                        size="small"
                        min={1}
                    />
                    <span className={styles.customLabel}>
                        {t("snooze.customHours", "hours")}
                    </span>
                    <Button
                        variant="primary"
                        size="small"
                        onClick={applyCustom}
                        disabled={!customHours || Number(customHours) <= 0}
                    >
                        {t("snooze.apply", "Apply")}
                    </Button>
                </div>
            </PopoverSurface>
        </Popover>
    );
}

export default SnoozeButton;
