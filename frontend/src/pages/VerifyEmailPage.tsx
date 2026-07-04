import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
    makeStyles,
    tokens,
    Card,
    Input,
    Button,
    Label,
    Title3,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    Spinner,
} from "@fluentui/react-components";
import { useVerifyEmail } from "../hooks/useAuth";
import { resendVerification } from "../api/auth";
import { useTranslation, Trans } from "react-i18next";
import Seo from "../components/Seo";

const useStyles = makeStyles({
    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: tokens.colorNeutralBackground2,
        padding: tokens.spacingHorizontalL,
    },
    verifyCard: {
        width: "100%",
        maxWidth: "420px",
    },
    cardBody: {
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
    },
    codeInputs: {
        display: "flex",
        gap: tokens.spacingHorizontalS,
        justifyContent: "center",
    },
    codeInput: {
        width: "48px",
        textAlign: "center",
    },
    submitButton: {
        width: "100%",
    },
    resendRow: {
        display: "flex",
        justifyContent: "center",
        gap: tokens.spacingHorizontalS,
    },
});

export default function VerifyEmailPage() {
    const styles = useStyles();
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
        <main className={styles.pageContainer}>
            <Seo
                title={t("auth.verifyEmailHeading")}
                canonicalPath="/verify"
                robots="noindex, nofollow"
            />
            <Card className={styles.verifyCard}>
                <div className={styles.cardBody}>
                    <Title3 as="h1">{t("auth.verifyEmailHeading")}</Title3>
                    <p style={{ margin: 0, color: "var(--colorNeutralForeground2)" }}>
                        <Trans
                            i18nKey="auth.codeSentTo"
                            values={{ email: email || t("auth.yourEmailFallback") }}
                            components={{ 1: <strong /> }}
                        />
                    </p>

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

                    <form
                        onSubmit={handleSubmit}
                        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                    >
                        <div className={styles.codeInputs} onPaste={handlePaste}>
                            {code.map((digit, i) => (
                                <Input
                                    key={i}
                                    ref={(el) => {
                                        inputRefs.current[i] = el;
                                    }}
                                    className={styles.codeInput}
                                    value={digit}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleChange(i, e.target.value)
                                    }
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                                        handleKeyDown(i, e)
                                    }
                                    maxLength={1}
                                    aria-label={t("auth.digitLabel", { index: i + 1 })}
                                />
                            ))}
                        </div>

                        <Button
                            type="submit"
                            appearance="primary"
                            className={styles.submitButton}
                            disabled={verifyMutation.isPending || code.join("").length !== 6}
                        >
                            {verifyMutation.isPending ? (
                                <Spinner size="tiny" />
                            ) : (
                                t("auth.verifyButton")
                            )}
                        </Button>
                    </form>

                    <div className={styles.resendRow}>
                        <span style={{ fontSize: "var(--fontSizeBase300)" }}>
                            {t("auth.didntReceiveCode")}
                        </span>
                        <Button appearance="transparent" size="small" onClick={handleResend}>
                            {t("auth.resend")}
                        </Button>
                    </div>

                    <div className={styles.resendRow}>
                        <Link to="/login" style={{ fontSize: "var(--fontSizeBase300)" }}>
                            {t("auth.backToSignIn")}
                        </Link>
                    </div>
                </div>
            </Card>
        </main>
    );
}
