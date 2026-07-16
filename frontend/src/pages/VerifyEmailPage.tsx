import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
    Input,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    Spinner,
} from "@fluentui/react-components";
import { useVerifyEmail } from "../hooks/useAuth";
import { resendVerification } from "../api/auth";
import { useTranslation, Trans } from "react-i18next";
import Seo from "../components/Seo";
import { Button } from "../components/ui/Button";
import styles from "./Auth.module.css";
import motion from "../design-system/motion.module.css";

export default function VerifyEmailPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";
    const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const verifyMutation = useVerifyEmail();
    const [resendStatus, setResendStatus] = useState<string>("");

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only digits
        // Handle multi-digit auto-fill (e.g., OTP from SMS via
        // autoComplete="one-time-code" on the first input).
        if (value.length > 1) {
            const digits = value.slice(0, 6).split("");
            const newCode = [...code];
            for (let i = 0; i < 6; i++) {
                newCode[i] = digits[i] ?? "";
            }
            setCode(newCode);
            inputRefs.current[Math.min(digits.length, 6) - 1]?.focus();
            return;
        }
        const newCode = [...code];
        newCode[index] = value.slice(-1); // Keep only last digit
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            const newCode = pasted.split("");
            setCode(newCode);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join("");
        if (fullCode.length !== 6) return;
        verifyMutation.mutate({ email, code: fullCode });
    };

    const handleResend = async () => {
        try {
            await resendVerification(email);
            setResendStatus("sent");
        } catch {
            setResendStatus("error");
        }
    };

    return (
        <main className={styles.shell}>
            <Seo
                title={t("auth.verifyEmailHeading")}
                canonicalPath="/verify"
                robots="noindex, nofollow"
            />
            <div className={`${styles.card} ${motion.slideUp}`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t("auth.verifyEmailHeading")}</h1>
                    <p className={styles.subtitle}>
                        <Trans
                            i18nKey="auth.codeSentTo"
                            values={{ email: email || t("auth.yourEmailFallback") }}
                            components={{ 1: <strong /> }}
                        />
                    </p>
                </div>

                {verifyMutation.isError && (
                    <MessageBar intent="error" role="alert">
                        <MessageBarBody>
                            <MessageBarTitle>
                                {t("auth.verificationFailedTitle")}
                            </MessageBarTitle>
                            {(verifyMutation.error as any)?.response?.data?.message ||
                                t("auth.invalidOrExpiredCode")}
                        </MessageBarBody>
                    </MessageBar>
                )}

                {resendStatus === "sent" && (
                    <MessageBar intent="success">
                        <MessageBarBody>{t("auth.newCodeSent")}</MessageBarBody>
                    </MessageBar>
                )}

                {resendStatus === "error" && (
                    <MessageBar intent="error" role="alert">
                        <MessageBarBody>{t("auth.resendCodeFailed")}</MessageBarBody>
                    </MessageBar>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup} onPaste={handlePaste}>
                        {code.map((digit, i) => (
                            <Input
                                key={i}
                                ref={(el) => {
                                    inputRefs.current[i] = el;
                                }}
                                className={`${styles.field} ${styles.codeInput}`}
                                value={digit}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleChange(i, e.target.value)
                                }
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                                    handleKeyDown(i, e)
                                }
                                maxLength={i === 0 ? 6 : 1}
                                autoComplete={i === 0 ? "one-time-code" : undefined}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                aria-label={t("auth.digitLabel", { index: i + 1 })}
                            />
                        ))}
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        className={styles.submit}
                        disabled={verifyMutation.isPending || code.join("").length !== 6}
                        /* B-ui-184: preserve accessible name while the
                           pending Spinner replaces the visible label. */
                        aria-label={
                            verifyMutation.isPending
                                ? t("auth.verifyButton")
                                : undefined
                        }
                    >
                        {verifyMutation.isPending ? (
                            <Spinner size="tiny" aria-hidden="true" />
                        ) : (
                            t("auth.verifyButton")
                        )}
                    </Button>
                </form>

                <div className={styles.actions}>
                    <span className={styles.footer}>{t("auth.didntReceiveCode")}</span>
                    <Button variant="ghost" size="small" onClick={handleResend}>
                        {t("auth.resend")}
                    </Button>
                </div>

                <div className={styles.footer}>
                    <Link to="/login" className={styles.link}>
                        {t("auth.backToSignIn")}
                    </Link>
                </div>
            </div>
        </main>
    );
}
