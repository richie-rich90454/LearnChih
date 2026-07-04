import { useState } from "react";
import { Link } from "react-router-dom";
import {
    makeStyles,
    tokens,
    Card,
    Input,
    Button,
    Label,
    Title3,
    Text,
    MessageBar,
    MessageBarBody,
    Spinner,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../api/password";
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
    card: {
        width: "100%",
        maxWidth: "420px",
    },
    cardBody: {
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
    },
    linkRow: {
        textAlign: "center",
    },
    link: {
        color: tokens.colorBrandForeground1,
    },
});

export default function ForgotPasswordPage() {
    const styles = useStyles();
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const mutation = useMutation({
        mutationFn: () => forgotPassword({ email }),
        onSuccess: () => setSubmitted(true),
    });

    return (
        <main className={styles.pageContainer}>
            <Seo
                title={t("auth.forgotPasswordTitle")}
                canonicalPath="/forgot-password"
                robots="noindex, follow"
            />
            <Card className={styles.card}>
                <div className={styles.cardBody}>
                    <Title3 as="h1">{t("auth.forgotPasswordTitle")}</Title3>

                    {submitted ? (
                        <MessageBar intent="success">
                            <MessageBarBody>{t("auth.resetEmailSent", { email })}</MessageBarBody>
                        </MessageBar>
                    ) : (
                        <>
                            {mutation.isError && (
                                <MessageBar intent="error">
                                    <MessageBarBody>{t("auth.resetEmailFailed")}</MessageBarBody>
                                </MessageBar>
                            )}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    mutation.mutate();
                                }}
                                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                            >
                                <div className={styles.formGroup}>
                                    <Label htmlFor="email" required>
                                        {t("auth.email")}
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder={t("auth.emailPlaceholder")}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    appearance="primary"
                                    disabled={mutation.isPending}
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

                    <div className={styles.linkRow}>
                        <Link
                            to="/login"
                            className={styles.link}
                            style={{ fontSize: "var(--fontSizeBase300)" }}
                        >
                            {t("auth.backToSignIn")}
                        </Link>
                    </div>
                </div>
            </Card>
        </main>
    );
}
