import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Input,
    Field,
    Toast,
    ToastTitle,
    useToastController,
} from "@fluentui/react-components";
import { EmojiAdd24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import { Button } from "./ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
    useCustomEmojiStore,
    MAX_EMOJI_SIZE,
    ALLOWED_EMOJI_TYPES,
} from "@/store/customEmojiStore";
import useAuthStore from "@/store/authStore";
import styles from "./CustomEmojiUploader.module.css";

/**
 * Custom emoji upload dialog (F58). Accepts image files up to 64 KB, converts
 * them to base64 data URLs, and stores them in the customEmojiStore for use
 * in post composition. Existing custom emojis are listed with remove buttons.
 *
 * Spec ref: F58.
 */
export function CustomEmojiUploader() {
    const { t } = useTranslation();
    const { dispatchToast } = useToastController("main-toaster");
    const reduced = useReducedMotion();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const emojis = useCustomEmojiStore((s) => s.emojis);
    const addEmoji = useCustomEmojiStore((s) => s.addEmoji);
    const removeEmoji = useCustomEmojiStore((s) => s.removeEmoji);
    const { user } = useAuthStore();
    const userName = user?.name ?? "Anonymous";

    const resetForm = useCallback(() => {
        setName("");
        setPreviewUrl(null);
        setFileError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setFileError(null);

            if (file.size > MAX_EMOJI_SIZE) {
                setFileError(
                    t("customEmoji.sizeError", "File exceeds 64 KB limit."),
                );
                return;
            }

            if (!ALLOWED_EMOJI_TYPES.includes(file.type)) {
                setFileError(
                    t("customEmoji.typeError", "Only PNG, JPEG, GIF, WebP, and SVG images are allowed."),
                );
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setPreviewUrl(result);
                if (!name) {
                    const baseName = file.name.replace(/\.[^.]+$/, "");
                    setName(baseName);
                }
            };
            reader.onerror = () => {
                setFileError(t("customEmoji.readError", "Failed to read file."));
            };
            reader.readAsDataURL(file);
        },
        [name, t],
    );

    const handleUpload = useCallback(() => {
        if (!previewUrl || !name.trim()) return;
        addEmoji(name.trim(), previewUrl, userName);
        dispatchToast(
            <Toast>
                <ToastTitle>
                    {t("customEmoji.uploaded", "Custom emoji added.")}
                </ToastTitle>
            </Toast>,
            { intent: "success" },
        );
        resetForm();
        setOpen(false);
    }, [previewUrl, name, addEmoji, userName, dispatchToast, t, resetForm]);

    const handleRemove = useCallback(
        (id: string) => {
            removeEmoji(id);
            dispatchToast(
                <Toast>
                    <ToastTitle>
                        {t("customEmoji.removed", "Custom emoji removed.")}
                    </ToastTitle>
                </Toast>,
                { intent: "info" },
            );
        },
        [removeEmoji, dispatchToast, t],
    );

    return (
        <Dialog
            open={open}
            onOpenChange={(_, d) => {
                setOpen(d.open);
                if (!d.open) resetForm();
            }}
        >
            <DialogTrigger disableButtonEnhancement>
                <Button variant="outline" size="small" icon={<EmojiAdd24Regular />}>
                    {t("customEmoji.button", "Custom emoji")}
                </Button>
            </DialogTrigger>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    <DialogTitle>
                        {t("customEmoji.title", "Upload custom emoji")}
                    </DialogTitle>
                    <DialogContent>
                        <p className={styles.description}>
                            {t(
                                "customEmoji.description",
                                "Upload an image (max 64 KB) to use as a custom emoji in your posts.",
                            )}
                        </p>
                        <div className={styles.form}>
                            <Field
                                label={t("customEmoji.fileLabel", "Image file")}
                                validationMessage={fileError ?? undefined}
                                validationState={fileError ? "error" : "none"}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={ALLOWED_EMOJI_TYPES.join(",")}
                                    onChange={handleFileSelect}
                                    className={styles.fileInput}
                                    aria-label={t("customEmoji.fileLabel", "Image file")}
                                />
                            </Field>
                            {previewUrl && (
                                <div className={styles.preview}>
                                    <img
                                        src={previewUrl}
                                        alt={t("customEmoji.preview", "Preview")}
                                        className={styles.previewImage}
                                    />
                                    <span className={styles.previewSize}>
                                        {Math.round((previewUrl.length * 3) / 4 / 1024)} KB
                                    </span>
                                </div>
                            )}
                            <Field
                                label={t("customEmoji.nameLabel", "Emoji name")}
                                required
                            >
                                <Input
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setName(e.target.value)
                                    }
                                    placeholder={t("customEmoji.namePlaceholder", "e.g., party_parrot")}
                                />
                            </Field>
                        </div>
                        {emojis.length > 0 && (
                            <div className={styles.emojiList}>
                                <div className={styles.emojiListHeader}>
                                    {t("customEmoji.existing", "Your custom emojis")}
                                </div>
                                <div className={styles.emojiGrid}>
                                    {emojis.map((emoji) => (
                                        <div key={emoji.id} className={styles.emojiItem}>
                                            <img
                                                src={emoji.dataUrl}
                                                alt={emoji.name}
                                                className={styles.emojiImage}
                                                title={emoji.name}
                                            />
                                            <span className={styles.emojiName}>
                                                :{emoji.name}:
                                            </span>
                                            <button
                                                type="button"
                                                className={styles.removeButton}
                                                onClick={() => handleRemove(emoji.id)}
                                                aria-label={t("customEmoji.remove", "Remove")}
                                            >
                                                <Dismiss24Regular />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="subtle"
                            onClick={() => {
                                resetForm();
                                setOpen(false);
                            }}
                        >
                            {t("common.cancel", "Cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpload}
                            disabled={!previewUrl || !name.trim()}
                            style={reduced ? { transitionDuration: "0.01ms" } : undefined}
                        >
                            {t("customEmoji.upload", "Upload")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default CustomEmojiUploader;
