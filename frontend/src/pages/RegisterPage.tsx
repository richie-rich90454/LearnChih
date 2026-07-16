import { useState } from "react";
import { Link } from "react-router-dom";
import {
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    Spinner,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useRegister } from "../hooks/useAuth";
import { useFocusFirstInput } from "../hooks/useFocusFirstInput";
import Seo from "../components/Seo";
import OAuthButtons from "../components/OAuthButtons";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import styles from "./Auth.module.css";
import motion from "../design-system/motion.module.css";

export default function RegisterPage() {
    const { t } = useTranslation();
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const registerMutation = useRegister();
    useFocusFirstInput();

    const [validationError, setValidationError] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError("");

        if (!name || !email || !password || !confirmPassword) {
            setValidationError(t("auth.allFieldsRequired"));
            return;
        }
        if (password !== confirmPassword) {
            setValidationError(t("auth.passwordsDoNotMatch"));
            return;
        }
        if (password.length < 6) {
            setValidationError(t("auth.passwordMinLength"));
            return;
        }

        registerMutation.mutate({ email, password, name });
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
                title={t("auth.registerTitle")}
                canonicalPath="/register"
                robots="noindex, follow"
            />
            <div className={`${styles.card} ${motion.slideUp}`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t("auth.registerTitle")}</h1>
                </div>

                {validationError && (
                    <MessageBar intent="error" role="alert">
                        <MessageBarBody>{validationError}</MessageBarBody>
                    </MessageBar>
                )}

                {registerMutation.isError && (
                    <MessageBar intent="error" role="alert">
                        <MessageBarBody>
                            <MessageBarTitle>{t("auth.registrationFailed")}</MessageBarTitle>
                            {(registerMutation.error as any)?.response?.data?.message ||
                                t("errors.generic")}
                        </MessageBarBody>
                    </MessageBar>
                )}

                <form className={styles.form} onSubmit={handleSubmit} aria-label={t("auth.registerTitle")}>
                    <Input
                        id="name"
                        label={requiredLabel(t("auth.username"))}
                        autoComplete="username"
                        size="large"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setName(e.target.value)
                        }
                        placeholder={t("auth.namePlaceholder")}
                        required
                    />

                    <Input
                        id="email"
                        label={requiredLabel(t("auth.email"))}
                        type="email"
                        autoComplete="email"
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
                        label={requiredLabel(t("auth.password"))}
                        type="password"
                        autoComplete="new-password"
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
                        label={requiredLabel(t("auth.confirmPassword"))}
                        type="password"
                        autoComplete="new-password"
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
                        disabled={registerMutation.isPending}
                        /* B-ui-176: preserve accessible name while the
                           pending Spinner replaces the visible label. */
                        aria-label={
                            registerMutation.isPending
                                ? t("auth.registerButton")
                                : undefined
                        }
                    >
                        {registerMutation.isPending ? (
                            <Spinner size="tiny" aria-hidden="true" />
                        ) : (
                            t("auth.registerButton")
                        )}
                    </Button>
                </form>

                <OAuthButtons />

                <div className={styles.actions}>
                    <span className={styles.footer}>{t("auth.alreadyHaveAccount")}</span>
                    <Link to="/login" className={styles.link}>
                        {t("auth.signInButton")}
                    </Link>
                </div>
            </div>
        </main>
    );
}
