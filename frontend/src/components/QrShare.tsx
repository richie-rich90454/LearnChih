import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { QrCode24Regular } from "@fluentui/react-icons";
import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import dialogStyles from "@/components/ui/Dialog.module.css";
import styles from "./QrShare.module.css";

interface QrShareProps {
    title: string;
    url: string;
}

/**
 * QR-code sharing affordance (F84). Renders a compact outline trigger that
 * opens a Dialog showing the page URL encoded as a QR code on a canvas.
 * A Download PNG action exports the canvas via toDataURL. If canvas QR
 * generation fails (e.g. insecure context, library error), the dialog
 * falls back to a remote img from api.qrserver.com so the user still gets
 * a scannable code. The URL is also shown as text for manual copy.
 *
 * Spec ref: F84.
 */
export function QrShare({ title, url }: QrShareProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [failed, setFailed] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!open) return;
        setFailed(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        QRCode.toCanvas(
            canvas,
            url,
            {
                width: 240,
                margin: 2,
                color: { dark: "#0a0a0b", light: "#fafafa" },
                errorCorrectionLevel: "M",
            },
            (err: Error | null | undefined) => {
                if (err) setFailed(true);
            },
        );
    }, [open, url]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas || failed) return;
        const link = document.createElement("a");
        link.download = "lernchih-qr.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const fallbackSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=2&data=${encodeURIComponent(
        url,
    )}`;

    return (
        <Dialog open={open} onOpenChange={(_: unknown, d: { open: boolean }) => setOpen(d.open)}>
            <DialogTrigger disableButtonEnhancement>
                <Button
                    variant="outline"
                    size="small"
                    icon={<QrCode24Regular />}
                    aria-label={t("qrShare.triggerLabel", { title })}
                >
                    {t("qrShare.trigger")}
                </Button>
            </DialogTrigger>
            <DialogSurface className={dialogStyles.surface}>
                <DialogBody className={dialogStyles.body}>
                    <DialogTitle className={dialogStyles.title}>
                        {t("qrShare.title", { title })}
                    </DialogTitle>
                    <DialogContent className={dialogStyles.content}>
                        <div className={styles.qrWrap}>
                            {failed ? (
                                <img
                                    className={styles.fallbackImg}
                                    src={fallbackSrc}
                                    alt={t("qrShare.fallbackAlt")}
                                    width={240}
                                    height={240}
                                />
                            ) : (
                                <canvas
                                    ref={canvasRef}
                                    className={styles.canvas}
                                    width={240}
                                    height={240}
                                    role="img"
                                    aria-label={t("qrShare.canvasAlt", { title })}
                                />
                            )}
                        </div>
                        <p className={styles.urlLine} dir="ltr">
                            {url}
                        </p>
                    </DialogContent>
                    <DialogActions className={dialogStyles.footer}>
                        <Button variant="subtle" onClick={() => setOpen(false)}>
                            {t("common.close")}
                        </Button>
                        <Button variant="primary" onClick={handleDownload} disabled={failed}>
                            {t("qrShare.download")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default QrShare;
