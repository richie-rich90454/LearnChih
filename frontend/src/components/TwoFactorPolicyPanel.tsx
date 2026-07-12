import { useState } from "react";
import { Switch, MessageBar, MessageBarBody, Checkbox } from "@fluentui/react-components";
import { ShieldKeyhole24Regular, Warning24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    useTwoFactorPolicyStore,
    TWO_FACTOR_ROLES,
} from "@/store/twoFactorPolicyStore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import styles from "./TwoFactorPolicyPanel.module.css";

export default function TwoFactorPolicyPanel() {
    const { t } = useTranslation();
    const requireForRoles = useTwoFactorPolicyStore((s) => s.requireForRoles);
    const gracePeriodDays = useTwoFactorPolicyStore((s) => s.gracePeriodDays);
    const enforcementEnabled = useTwoFactorPolicyStore((s) => s.enforcementEnabled);
    const setRequiredRoles = useTwoFactorPolicyStore((s) => s.setRequiredRoles);
    const setGracePeriod = useTwoFactorPolicyStore((s) => s.setGracePeriod);
    const toggleEnforcement = useTwoFactorPolicyStore((s) => s.toggleEnforcement);

    const [grace, setGrace] = useState(String(gracePeriodDays));

    const toggleRole = (role: string) => {
        if (requireForRoles.includes(role)) {
            setRequiredRoles(requireForRoles.filter((r) => r !== role));
        } else {
            setRequiredRoles([...requireForRoles, role]);
        }
    };

    const handleGraceChange = (value: string) => {
        setGrace(value);
        const num = Number(value);
        if (!Number.isNaN(num) && num >= 0) {
            setGracePeriod(num);
        }
    };

    return (
        <Card padding="lg" className={styles.panel}>
            <div className={styles.head}>
                <span className={styles.icon} aria-hidden="true">
                    <ShieldKeyhole24Regular />
                </span>
                <h2 className={styles.title}>
                    {t("twoFactorPolicy.title", "Two-factor enforcement")}
                </h2>
                <Switch
                    checked={enforcementEnabled}
                    onChange={toggleEnforcement}
                    aria-label={t("twoFactorPolicy.toggleAria", "Toggle enforcement")}
                    className={styles.switch}
                />
            </div>

            {enforcementEnabled && (
                <MessageBar intent="warning">
                    <MessageBarBody>
                        <Warning24Regular className={styles.inlineIcon} />
                        {t(
                            "twoFactorPolicy.warning",
                            "Enforcement is active. Affected users must enable 2FA within the grace period or lose access.",
                        )}
                    </MessageBarBody>
                </MessageBar>
            )}

            <div className={styles.field}>
                <span className={styles.fieldLabel}>
                    {t("twoFactorPolicy.requiredRoles", "Required roles")}
                </span>
                <div className={styles.roleList}>
                    {TWO_FACTOR_ROLES.map((role) => (
                        <Checkbox
                            key={role}
                            checked={requireForRoles.includes(role)}
                            onChange={() => toggleRole(role)}
                            label={role}
                        />
                    ))}
                </div>
            </div>

            <Input
                label={t("twoFactorPolicy.gracePeriod", "Grace period (days)")}
                type="number"
                value={grace}
                onChange={(_, d) => handleGraceChange(d.value)}
                min={0}
            />
        </Card>
    );
}
