import { useState } from "react";
import {
    makeStyles,
    tokens,
    Button,
    Input,
    Label,
    Text,
    Title3,
    Spinner,
    MessageBar,
    MessageBarBody,
    Card,
} from "@fluentui/react-components";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { setupTwoFactor, verifyTwoFactor, type TwoFactorSetupResponse } from "../api/twoFactor";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        maxWidth: "420px",
    },
    qrCode: {
        width: "200px",
        height: "200px",
        objectFit: "contain",
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusMedium,
    },
    secret: {
        fontFamily: "monospace",
        wordBreak: "break-all",
        backgroundColor: tokens.colorNeutralBackground1Hover,
        padding: tokens.spacingHorizontalS,
        borderRadius: tokens.borderRadiusSmall,
    },
    backupCodes: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: tokens.spacingHorizontalS,
        fontFamily: "monospace",
    },
});

export default function TwoFactorSetup() {
    const styles = useStyles();
    const { t } = useTranslation();
    const [step, setStep] = useState<"intro" | "setup" | "verified">("intro");
    const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    const setupMutation = useMutation({
        mutationFn: () => setupTwoFactor(),
        onSuccess: (response) => {
            setSetupData(response.data);
            setStep("setup");
            setError("");
        },
        onError: () => setError(t("twoFactor.setupFailed")),
    });

    const verifyMutation = useMutation({
        mutationFn: () => verifyTwoFactor({ code }),
        onSuccess: () => {
            setStep("verified");
            setError("");
        },
        onError: () => setError(t("twoFactor.verifyFailed")),
    });

    if (step === "intro") {
        return (
            <div className={styles.container}>
                <Title3>{t("twoFactor.title")}</Title3>
                <Text>{t("twoFactor.intro")}</Text>
                <Button
                    appearance="primary"
                    onClick={() => setupMutation.mutate()}
                    disabled={setupMutation.isPending}
                    /* B-ui-183: preserve accessible name while the pending
                       Spinner replaces the visible label. */
                    aria-label={
                        setupMutation.isPending
                            ? t("twoFactor.setUp")
                            : undefined
                    }
                >
                    {setupMutation.isPending ? <Spinner size="tiny" aria-hidden="true" /> : t("twoFactor.setUp")}
                </Button>
                {error && (
                    <MessageBar intent="error">
                        <MessageBarBody>{error}</MessageBarBody>
                    </MessageBar>
                )}
            </div>
        );
    }

    if (step === "verified") {
        return (
            <div className={styles.container}>
                <Title3>{t("twoFactor.enabled")}</Title3>
                <MessageBar intent="success">
                    <MessageBarBody>{t("twoFactor.enabledMessage")}</MessageBarBody>
                </MessageBar>
            </div>
        );
    }

    return (
        <Card className={styles.container}>
            <Title3>{t("twoFactor.setUpAuthenticator")}</Title3>
            <Text>{t("twoFactor.scanQr")}</Text>

            {setupData?.qrCodeUrl && (
                <img src={setupData.qrCodeUrl} alt={t("twoFactor.qrAlt")} className={styles.qrCode} />
            )}

            <div>
                <Text>{t("twoFactor.manualSecret")}</Text>
                <div className={styles.secret}>{setupData?.secret}</div>
            </div>

            <div
                style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalXS }}
            >
                <Label htmlFor="totp-code">{t("twoFactor.codeLabel")}</Label>
                <Input
                    id="totp-code"
                    value={code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                />
            </div>

            <Button
                appearance="primary"
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending || code.length < 6}
                aria-label={
                    verifyMutation.isPending
                        ? t("twoFactor.verify")
                        : undefined
                }
            >
                {verifyMutation.isPending ? <Spinner size="tiny" /> : t("twoFactor.verify")}
            </Button>

            {setupData?.backupCodes && (
                <div>
                    <Text weight="semibold">{t("twoFactor.backupCodes")}</Text>
                    <Text size={300}>{t("twoFactor.saveBackupHint")}</Text>
                    <div className={styles.backupCodes}>
                        {setupData.backupCodes.map((c, i) => (
                            <span key={i}>{c}</span>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <MessageBar intent="error">
                    <MessageBarBody>{error}</MessageBarBody>
                </MessageBar>
            )}
        </Card>
    );
}
