import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Play24Regular, Stop24Regular } from "@fluentui/react-icons";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ReadAlongHighlight.module.css";

export interface ReadAlongHighlightProps {
    text: string;
}

interface Sentence {
    text: string;
    start: number;
    end: number;
}

/**
 * Splits `text` into sentences using `/[.!?]+/` as the delimiter, tracking
 * each sentence's character offset in the original text so that
 * `onboundary` char indices from the Web Speech API can be mapped to a
 * sentence index.
 */
function splitSentencesWithOffsets(text: string): Sentence[] {
    const result: Sentence[] = [];
    const regex = /[.!?]+/g;
    let lastEnd = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
        const sentenceText = text.slice(lastEnd, match.index);
        if (sentenceText.trim().length > 0) {
            result.push({
                text: sentenceText + match[0],
                start: lastEnd,
                end: match.index + match[0].length,
            });
        }
        lastEnd = regex.lastIndex;
    }
    if (lastEnd < text.length) {
        const trailing = text.slice(lastEnd);
        if (trailing.trim().length > 0) {
            result.push({
                text: trailing,
                start: lastEnd,
                end: text.length,
            });
        }
    }
    return result;
}

/**
 * Read-along highlight sync (F29). Splits the text into sentences, speaks it
 * via the Web Speech API, and highlights the sentence currently being read
 * using `onboundary` char-index events. Provides Play/Stop controls.
 *
 * Spec ref: F29.
 */
export function ReadAlongHighlight({ text }: ReadAlongHighlightProps) {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const [playing, setPlaying] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const supported =
        typeof window !== "undefined" && "speechSynthesis" in window;

    const sentences = useMemo(
        () => splitSentencesWithOffsets(text),
        [text],
    );

    // Cancel any in-progress speech on unmount.
    useEffect(() => {
        return () => {
            if (supported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [supported]);

    const handlePlay = () => {
        if (!supported || !text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => {
            setPlaying(true);
            setActiveIndex(0);
        };
        utterance.onend = () => {
            setPlaying(false);
            setActiveIndex(-1);
        };
        utterance.onerror = () => {
            setPlaying(false);
            setActiveIndex(-1);
        };
        utterance.onboundary = (event: SpeechSynthesisEvent) => {
            const charIndex = event.charIndex;
            const idx = sentences.findIndex(
                (s) => charIndex >= s.start && charIndex < s.end,
            );
            if (idx >= 0) {
                setActiveIndex(idx);
            }
        };
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const handleStop = () => {
        if (!supported) return;
        window.speechSynthesis.cancel();
        setPlaying(false);
        setActiveIndex(-1);
    };

    if (!supported || sentences.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <Button
                    variant={playing ? "outline" : "primary"}
                    icon={<Play24Regular />}
                    onClick={handlePlay}
                    disabled={playing}
                    className={reduced ? styles.noAnim : undefined}
                >
                    {t("readAlong.play", "Read along")}
                </Button>
                <Button
                    variant="subtle"
                    icon={<Stop24Regular />}
                    onClick={handleStop}
                    disabled={!playing}
                >
                    {t("readAlong.stop", "Stop")}
                </Button>
            </div>
            <div className={styles.sentences}>
                {sentences.map((sentence, idx) => (
                    <p
                        key={idx}
                        className={
                            idx === activeIndex ? styles.sentenceActive : styles.sentence
                        }
                    >
                        {sentence.text}
                    </p>
                ))}
            </div>
        </div>
    );
}

export default ReadAlongHighlight;
