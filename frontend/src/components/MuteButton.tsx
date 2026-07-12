import { useTranslation } from "react-i18next";
import {
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
} from "@fluentui/react-components";
import { SpeakerOff24Regular, SpeakerMute24Regular } from "@fluentui/react-icons";
import { useMuteStore } from "@/store/muteStore";
import { Button } from "@/components/ui/Button";
import styles from "./MuteButton.module.css";

export interface MuteButtonProps {
    id: string;
    type: "thread" | "channel";
}

interface DurationOption {
    key: string;
    minutes: number | null;
    /** i18n key under the "mute" namespace. */
    labelKey: string;
    /** English fallback. */
    defaultLabel: string;
}

const DURATIONS: DurationOption[] = [
    { key: "30m", minutes: 30, labelKey: "duration30m", defaultLabel: "30 minutes" },
    { key: "1h", minutes: 60, labelKey: "duration1h", defaultLabel: "1 hour" },
    { key: "8h", minutes: 480, labelKey: "duration8h", defaultLabel: "8 hours" },
    { key: "24h", minutes: 1440, labelKey: "duration24h", defaultLabel: "24 hours" },
    { key: "forever", minutes: null, labelKey: "forever", defaultLabel: "Until I unmute" },
];

/**
 * Mute toggle for a thread or channel. When not muted, the button opens a
 * dropdown of duration options; when muted, it shows an "Unmute" action
 * that clears the entry immediately. A muted-with-duration state surfaces
 * the expiry time in the button title.
 *
 * Spec ref: F78.
 */
export function MuteButton({ id, type }: MuteButtonProps) {
    const { t } = useTranslation();
    const entry = useMuteStore((s) => s.muted[id]);
    const mute = useMuteStore((s) => s.mute);
    const unmute = useMuteStore((s) => s.unmute);

    const isMuted = entry
        ? entry.until === null || new Date(entry.until).getTime() > Date.now()
        : false;

    const mutedTitle =
        entry && entry.until
            ? t("mute.mutedUntil", "Muted until {{time}}", {
                  time: new Date(entry.until).toLocaleString(),
              })
            : t("mute.mutedForever", "Muted");

    if (isMuted) {
        return (
            <Button
                variant="subtle"
                size="small"
                icon={<SpeakerMute24Regular className={styles.mutedIndicator} />}
                onClick={() => unmute(id)}
                title={mutedTitle}
            >
                {t("mute.unmute", "Unmute")}
            </Button>
        );
    }

    return (
        <Menu>
            <MenuTrigger disableButtonEnhancement>
                <Button
                    variant="subtle"
                    size="small"
                    icon={<SpeakerOff24Regular />}
                >
                    {t("mute.mute", "Mute")}
                </Button>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    {DURATIONS.map((opt) => (
                        <MenuItem
                            key={opt.key}
                            onClick={() => mute(id, type, opt.minutes)}
                        >
                            {t(`mute.${opt.labelKey}`, opt.defaultLabel)}
                        </MenuItem>
                    ))}
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}

export default MuteButton;
