import { useState } from "react";
import { Dropdown, Option } from "@fluentui/react-components";
import { PlugConnected24Regular, Delete24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    useOAuthAccountsStore,
    OAUTH_PROVIDERS,
    type OAuthProvider,
} from "@/store/oauthAccountsStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./OAuthAccountsManager.module.css";

export default function OAuthAccountsManager() {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const connected = useOAuthAccountsStore((s) => s.connected);
    const disconnect = useOAuthAccountsStore((s) => s.disconnect);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2500);
    };

    const handleConnect = (provider: OAuthProvider) => {
        showToast(
            t("oauthAccounts.notImplemented", "OAuth flow not implemented in this demo"),
        );
    };

    return (
        <div className={styles.page}>
            <div className={styles.connectRow}>
                <span className={styles.connectLabel}>
                    {t("oauthAccounts.connectNew", "Connect new account")}
                </span>
                <Dropdown
                    placeholder={t("oauthAccounts.selectProvider", "Select provider")}
                    aria-label={t("oauthAccounts.selectProvider", "Select provider")}
                    onOptionSelect={(_, d) => {
                        if (d.optionValue) {
                            handleConnect(d.optionValue as OAuthProvider);
                        }
                    }}
                    className={styles.dropdown}
                >
                    {OAUTH_PROVIDERS.map((provider) => (
                        <Option key={provider} value={provider}>
                            {t(`oauthAccounts.providers.${provider}`, provider)}
                        </Option>
                    ))}
                </Dropdown>
            </div>

            {toast && (
                <div
                    className={styles.toast}
                    role="status"
                    aria-live="polite"
                    style={reduced ? { transitionDuration: "0ms" } : undefined}
                >
                    {toast}
                </div>
            )}

            {connected.length === 0 ? (
                <p className={styles.empty}>
                    {t("oauthAccounts.noAccounts", "No connected accounts.")}
                </p>
            ) : (
                <ul className={styles.list}>
                    {connected.map((account) => (
                        <li key={account.id}>
                            <Card padding="md" className={styles.accountCard}>
                                <div className={styles.accountHead}>
                                    <span className={styles.providerIcon} aria-hidden="true">
                                        <PlugConnected24Regular />
                                    </span>
                                    <span className={styles.provider}>
                                        {t(`oauthAccounts.providers.${account.provider}`, account.provider)}
                                    </span>
                                    <Badge variant="success" size="small">
                                        {t("oauthAccounts.connected", "Connected")}
                                    </Badge>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Delete24Regular />}
                                        onClick={() => disconnect(account.id)}
                                        className={styles.disconnectBtn}
                                    >
                                        {t("oauthAccounts.disconnect", "Disconnect")}
                                    </Button>
                                </div>
                                <div className={styles.accountDetails}>
                                    <span className={styles.email}>{account.email}</span>
                                    <span className={styles.connectedAt}>
                                        {t("oauthAccounts.connectedAt", "Connected")}:{" "}
                                        {new Date(account.connectedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
