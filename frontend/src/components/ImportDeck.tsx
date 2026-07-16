import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpload24Regular } from "@fluentui/react-icons";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ImportDeck.module.css";

export interface ImportDeckCard {
    front: string;
    back: string;
}

/**
 * File-upload deck importer (F27). Accepts .apkg and .csv files. For CSV,
 * parses rows as `front,back` pairs and previews the first 5 cards. For APKG,
 * shows a notice that backend support is required and preview is unavailable.
 *
 * Spec ref: F27.
 */
export function ImportDeck() {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const inputRef = useRef<HTMLInputElement>(null);
    const [cards, setCards] = useState<ImportDeckCard[]>([]);
    const [fileName, setFileName] = useState<string>("");
    const [isApkg, setIsApkg] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const reset = () => {
        setCards([]);
        setFileName("");
        setIsApkg(false);
        setError("");
    };

    const handleFile = (file: File) => {
        reset();
        setFileName(file.name);
        const lower = file.name.toLowerCase();
        if (lower.endsWith(".apkg")) {
            setIsApkg(true);
            return;
        }
        if (!lower.endsWith(".csv")) {
            setError(t("importDeck.unsupportedType", "Please select a .csv or .apkg file."));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = String(e.target?.result ?? "");
            const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
            const parsed: ImportDeckCard[] = lines.map((line) => {
                const parts = line.split(",");
                return {
                    front: (parts[0] ?? "").trim(),
                    back: (parts[1] ?? "").trim(),
                };
            });
            setCards(parsed);
        };
        reader.onerror = () => {
            setError(t("importDeck.readError", "Could not read the file."));
        };
        reader.readAsText(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleBrowse = () => {
        inputRef.current?.click();
    };

    const previewCards = cards.slice(0, 5);

    return (
        <div className={styles.container}>
            <input
                ref={inputRef}
                type="file"
                accept=".csv,.apkg"
                onChange={handleChange}
                className={styles.hiddenInput}
                aria-hidden="true"
                tabIndex={-1}
            />
            <Button
                variant="primary"
                icon={<ArrowUpload24Regular />}
                onClick={handleBrowse}
                className={reduced ? styles.noAnim : undefined}
            >
                {t("importDeck.chooseFile", "Choose file")}
            </Button>

            {fileName && (
                <p className={styles.fileName}>
                    {t("importDeck.selectedFile", "Selected")}: {fileName}
                </p>
            )}

            {error && <p className={styles.error}>{error}</p>}

            {isApkg && (
                <p className={styles.notice}>
                    {t(
                        "importDeck.apkgNotice",
                        "Anki package import requires backend support — preview unavailable.",
                    )}
                </p>
            )}

            {previewCards.length > 0 && (
                <div className={styles.preview}>
                    <p className={styles.previewLabel}>
                        {t("importDeck.preview", "Preview (first 5 cards)")}
                    </p>
                    <table
                        className={styles.table}
                        aria-label={t("importDeck.preview", "Preview (first 5 cards)")}
                    >
                        <thead>
                            <tr>
                                <th className={styles.th} scope="col">
                                    {t("importDeck.front", "Front")}
                                </th>
                                <th className={styles.th} scope="col">
                                    {t("importDeck.back", "Back")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {previewCards.map((card, idx) => (
                                <tr key={idx}>
                                    <td className={styles.td}>{card.front}</td>
                                    <td className={styles.td}>{card.back}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className={styles.totalCount}>
                        {t("importDeck.totalCards", {
                            defaultValue: "{{count}} cards parsed",
                            count: cards.length,
                        })}
                    </p>
                </div>
            )}
        </div>
    );
}

export default ImportDeck;
