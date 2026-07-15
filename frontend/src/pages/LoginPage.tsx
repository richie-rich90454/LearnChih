import { useState } from "react";
import {
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    Spinner,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { useFocusFirstInput } from "../hooks/useFocusFirstInput";
import Seo from "../components/Seo";
import OAuthButtons from "../components/OAuthButtons";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import styles from "./Auth.module.css";
import motion from "../design-system/motion.module.css";

export default function LoginPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get("redirect") || undefined;
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const loginMutation = useLogin(redirect);
    useFocusFirstInput();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        loginMutation.mutate({ email, password });
    };

    return (
        <main className={styles.shell}>
            <Seo title={t("auth.signInTitle")} canonicalPath="/login" robots="noindex, follow" />
            <div className={`${styles.card} ${motion.slideUp}`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t("auth.signInTitle")}</h1>
                </div>

                {loginMutation.isError && (
                    <MessageBar intent="error" role="alert">
                        <MessageBarBody>
                            <MessageBarTitle>{t("auth.loginFailed")}</MessageBarTitle>
                            {(loginMutation.error as any)?.response?.data?.message ||
                                t("auth.invalidCredentials")}
                        </MessageBarBody>
                    </MessageBar>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
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

                    <Input
                        id="password"
                        label={
                            <>
                                {t("auth.password")}
                                <span className={styles.requiredMark} aria-hidden="true">
                                    {" *"}
                                </span>
                            </>
                        }
                        type="password"
                        size="large"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
                        }
                        placeholder={t("auth.passwordPlaceholder")}
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        className={styles.submit}
                        disabled={loginMutation.isPending}
                        /* B-ui-171: preserve accessible name while the
                           pending Spinner replaces the visible label. */
                        aria-label={
                            loginMutation.isPending
                                ? t("auth.signInButton")
                                : undefined
                        }
                    >
                        {loginMutation.isPending ? <Spinner size="tiny" aria-hidden="true" /> : t("auth.signInButton")}
                    </Button>
                </form>

                <OAuthButtons />

                <div className={styles.actions}>
                    <Link to="/forgot-password" className={styles.link}>
                        {t("auth.forgotPassword")}
                    </Link>
                    <span className={styles.footer}>{t("auth.noAccount")}</span>
                    <Link to="/register" className={styles.link}>
                        {t("auth.register")}
                    </Link>
                </div>
            </div>
        </main>
    );
}
