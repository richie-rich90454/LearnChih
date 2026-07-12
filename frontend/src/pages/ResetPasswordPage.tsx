import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MessageBar, MessageBarBody, Spinner } from "@fluentui/react-components";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { resetPassword } from "../api/password";
import { useFocusFirstInput } from "../hooks/useFocusFirstInput";
import Seo from "../components/Seo";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import styles from "./Auth.module.css";
import motion from "../design-system/motion.module.css";

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState("");
    useFocusFirstInput();

    const mutation = useMutation({
        mutationFn: () => resetPassword({ token, newPassword: password }),
        onSuccess: () => {
            navigate("/login");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError("");
        if (password.length < 6) {
            setValidationError(t("auth.passwordMinLength"));
            return;
        }
        if (password !== confirmPassword) {
            setValidationError(t("auth.passwordsDoNotMatch"));
            return;
        }
        mutation.mutate();
    };

    const requiredLabel = (text: string) => (
        <>
            {text}
            <span className={styles.requiredMark} aria-hidden="true">
                {" *"}
            </span>
        </>
    );

    return (
        <main className={styles.shell}>
            <Seo
                title={t("auth.resetPasswordTitle")}
                canonicalPath="/reset-password"
                robots="noindex, follow"
            />
            <div className={`${styles.card} ${motion.slideUp}`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t("auth.resetPasswordTitle")}</h1>
                </div>

                {!token && (
                    <MessageBar intent="error" aria-live="polite">
                        <MessageBarBody>{t("auth.invalidResetLink")}</MessageBarBody>
                    </MessageBar>
                )}

                {validationError && (
                    <MessageBar intent="error" aria-live="polite">
                        <MessageBarBody>{validationError}</MessageBarBody>
                    </MessageBar>
                )}

                {mutation.isError && (
                    <MessageBar intent="error" aria-live="polite">
                        <MessageBarBody>{t("auth.resetPasswordFailed")}</MessageBarBody>
                    </MessageBar>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <Input
                        id="password"
                        label={requiredLabel(t("auth.newPassword"))}
                        type="password"
                        size="large"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
                        }
                        placeholder={t("auth.passwordPlaceholder")}
                        required
                    />
                    <Input
                        id="confirmPassword"
                        label={requiredLabel(t("auth.confirmNewPassword"))}
                        type="password"
                        size="large"
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setConfirmPassword(e.target.value)
                        }
                        placeholder={t("auth.confirmPasswordPlaceholder")}
                        required
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        className={styles.submit}
                        disabled={!token || mutation.isPending}
                    >
                        {mutation.isPending ? (
                            <Spinner size="tiny" />
                        ) : (
                            t("auth.resetPasswordButton")
                        )}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <Link to="/login" className={styles.link}>
                        {t("auth.backToSignIn")}
                    </Link>
                </div>
            </div>
        </main>
    );
}
