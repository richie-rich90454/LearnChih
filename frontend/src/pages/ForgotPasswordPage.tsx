import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageBar, MessageBarBody, Spinner } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../api/password";
import { useFocusFirstInput } from "../hooks/useFocusFirstInput";
import Seo from "../components/Seo";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import styles from "./Auth.module.css";
import motion from "../design-system/motion.module.css";

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    useFocusFirstInput();

    const mutation = useMutation({
        mutationFn: () => forgotPassword({ email }),
        onSuccess: () => setSubmitted(true),
    });

    return (
        <main className={styles.shell}>
            <Seo
                title={t("auth.forgotPasswordTitle")}
                canonicalPath="/forgot-password"
                robots="noindex, follow"
            />
            <div className={`${styles.card} ${motion.slideUp}`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t("auth.forgotPasswordTitle")}</h1>
                </div>

                {submitted ? (
                    <MessageBar intent="success">
                        <MessageBarBody>{t("auth.resetEmailSent", { email })}</MessageBarBody>
                    </MessageBar>
                ) : (
                    <>
                        {mutation.isError && (
                            <MessageBar intent="error" aria-live="polite">
                                <MessageBarBody>{t("auth.resetEmailFailed")}</MessageBarBody>
                            </MessageBar>
                        )}
                        <form
                            className={styles.form}
                            onSubmit={(e) => {
                                e.preventDefault();
                                mutation.mutate();
                            }}
                        >
                            <Input
                                id="email"
                                label={
                                    <>
                                        {t("auth.email")}
                                        <span className={styles.requiredMark} aria-hidden="true">
                                            {" *"}
                                        </span>
                                    </>
                                }
                                type="email"
                                size="large"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setEmail(e.target.value)
                                }
                                placeholder={t("auth.emailPlaceholder")}
                                required
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                className={styles.submit}
                                disabled={mutation.isPending}
                                /* B-ui-170: preserve accessible name while
                                   the pending Spinner replaces the label. */
                                aria-label={
                                    mutation.isPending
                                        ? t("auth.sendResetLink")
                                        : undefined
                                }
                            >
                                {mutation.isPending ? (
                                    <Spinner size="tiny" />
                                ) : (
                                    t("auth.sendResetLink")
                                )}
                            </Button>
                        </form>
                    </>
                )}

                <div className={styles.footer}>
                    <Link to="/login" className={styles.link}>
                        {t("auth.backToSignIn")}
                    </Link>
                </div>
            </div>
        </main>
    );
}
