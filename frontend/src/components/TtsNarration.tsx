import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Speaker024Regular,
    Play24Regular,
    Pause24Regular,
    Stop24Regular,
} from "@fluentui/react-icons";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./TtsNarration.module.css";

export interface TtsNarrationProps {
    text: string;
}

/**
 * Text-to-speech narration for a resource (F28). Renders a "Read aloud"
 * button that uses the Web Speech API (`window.speechSynthesis`) to speak
 * the provided text. Provides Pause/Resume/Stop controls while speaking.
 * Cancels any in-progress speech on unmount.
 *
 * Spec ref: F28.
 */
export function TtsNarration({ text }: TtsNarrationProps) {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const [speaking, setSpeaking] = useState<boolean>(false);
    const [paused, setPaused] = useState<boolean>(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const supported =
        typeof window !== "undefined" && "speechSynthesis" in window;

    // Cancel any in-progress speech on unmount.
    useEffect(() => {
        return () => {
            if (supported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [supported]);

    const handleSpeak = () => {
        if (!supported || !text) return;
        // Cancel any existing speech before starting a new one.
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => {
            setSpeaking(true);
            setPaused(false);
        };
        utterance.onend = () => {
            setSpeaking(false);
            setPaused(false);
        };
        utterance.onerror = () => {
            setSpeaking(false);
            setPaused(false);
        };
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const handlePauseResume = () => {
        if (!supported) return;
        if (paused) {
            window.speechSynthesis.resume();
            setPaused(false);
        } else {
            window.speechSynthesis.pause();
            setPaused(true);
        }
    };

    const handleStop = () => {
        if (!supported) return;
        window.speechSynthesis.cancel();
        setSpeaking(false);
        setPaused(false);
    };

    if (!supported) {
        return null;
    }

    return (
        <div className={styles.container}>
            {!speaking ? (
                <Button
                    variant="primary"
                    icon={<Speaker024Regular />}
                    onClick={handleSpeak}
                    disabled={!text}
                    className={reduced ? styles.noAnim : undefined}
                >
                    {t("ttsNarration.readAloud", "Read aloud")}
                </Button>
            ) : (
                <div className={styles.controls}>
                    <Button
                        variant={paused ? "primary" : "outline"}
                        icon={paused ? <Play24Regular /> : <Pause24Regular />}
                        onClick={handlePauseResume}
                    >
                        {paused
                            ? t("ttsNarration.resume", "Resume")
                            : t("ttsNarration.pause", "Pause")}
                    </Button>
                    <Button
                        variant="subtle"
                        icon={<Stop24Regular />}
                        onClick={handleStop}
                    >
                        {t("ttsNarration.stop", "Stop")}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default TtsNarration;
