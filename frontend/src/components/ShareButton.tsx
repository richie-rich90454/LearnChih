import { Share24Regular } from "@fluentui/react-icons";
import {
    Toast,
    ToastTitle,
    useToastController,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";

interface ShareButtonProps {
    title: string;
    url: string;
}

/**
 * Native Web Share API affordance (F83). Renders a compact outline button
 * that opens the native share sheet (navigator.share) with the page title and
 * URL when available; when the Web Share API is absent it copies the URL to
 * the clipboard and dispatches a "Link copied" toast. Cancellations from the
 * native sheet are respected (no clipboard write). No CSS module: the
 * design-system Button owns the visuals.
 *
 * Spec ref: F83.
 */
export function ShareButton({ title, url }: ShareButtonProps) {
    const { t } = useTranslation();
    const { dispatchToast } = useToastController("main-toaster");

    const handleShare = async () => {
        if (
            typeof navigator !== "undefined" &&
            typeof navigator.share === "function"
        ) {
            try {
                await navigator.share({ title, url });
                return;
            } catch {
                // User cancelled or the share failed; respect the cancellation.
                return;
            }
        }
        try {
            await navigator.clipboard?.writeText(url);
        } catch {
            // Clipboard unavailable (e.g. insecure context); notify anyway.
        }
        dispatchToast(
            <Toast>
                <ToastTitle>{t("share.linkCopied")}</ToastTitle>
            </Toast>,
            { intent: "success" },
        );
    };

    return (
        <Button
            variant="outline"
            size="small"
            icon={<Share24Regular />}
            onClick={handleShare}
        >
            {t("share.share")}
        </Button>
    );
}

export default ShareButton;
