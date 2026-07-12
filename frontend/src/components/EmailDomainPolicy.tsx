import { useState } from "react";
import { RadioGroup, Radio } from "@fluentui/react-components";
import { Delete24Regular, Add24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    useEmailDomainPolicyStore,
    type EmailDomainMode,
    type DomainListName,
} from "@/store/emailDomainPolicyStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import styles from "./EmailDomainPolicy.module.css";

function DomainListEditor({ list }: { list: DomainListName }) {
    const { t } = useTranslation();
    const domains = useEmailDomainPolicyStore((s) => s[list]);
    const addDomain = useEmailDomainPolicyStore((s) => s.addDomain);
    const removeDomain = useEmailDomainPolicyStore((s) => s.removeDomain);
    const [value, setValue] = useState("");

    const labelKey =
        list === "allowlist" ? "emailDomainPolicy.allowlist" : "emailDomainPolicy.denylist";

    const handleAdd = () => {
        if (!value.trim()) return;
        addDomain(value, list);
        setValue("");
    };

    return (
        <div className={styles.listEditor}>
            <span className={styles.listLabel}>{t(labelKey, list)}</span>
            {domains.length === 0 ? (
                <p className={styles.empty}>
                    {t("emailDomainPolicy.noDomains", "No domains.")}
                </p>
            ) : (
                <ul className={styles.domainList}>
                    {domains.map((domain) => (
                        <li key={domain} className={styles.domainItem}>
                            <code className={styles.domainCode}>{domain}</code>
                            <Button
                                variant="subtle"
                                size="small"
                                icon={<Delete24Regular />}
                                onClick={() => removeDomain(domain, list)}
                                aria-label={t("emailDomainPolicy.remove", "Remove")}
                            />
                        </li>
                    ))}
                </ul>
            )}
            <div className={styles.addRow}>
                <Input
                    placeholder={t("emailDomainPolicy.domainPlaceholder", "example.com")}
                    value={value}
                    onChange={(_, d) => setValue(d.value)}
                />
                <Button
                    variant="outline"
                    icon={<Add24Regular />}
                    onClick={handleAdd}
                    disabled={!value.trim()}
                >
                    {t("emailDomainPolicy.add", "Add")}
                </Button>
            </div>
        </div>
    );
}

export default function EmailDomainPolicy() {
    const { t } = useTranslation();
    const mode = useEmailDomainPolicyStore((s) => s.mode);
    const setMode = useEmailDomainPolicyStore((s) => s.setMode);

    return (
        <Card padding="lg" className={styles.panel}>
            <div className={styles.modeField}>
                <span className={styles.fieldLabel}>
                    {t("emailDomainPolicy.mode", "Policy mode")}
                </span>
                <RadioGroup
                    value={mode}
                    onChange={(_, d) => setMode(d.value as EmailDomainMode)}
                    className={styles.radioGroup}
                >
                    <Radio value="open" label={t("emailDomainPolicy.modeOpen", "Open (no restrictions)")} />
                    <Radio value="allowlist" label={t("emailDomainPolicy.modeAllowlist", "Allowlist only")} />
                    <Radio value="denylist" label={t("emailDomainPolicy.modeDenylist", "Denylist")} />
                </RadioGroup>
            </div>

            <div className={styles.lists}>
                <DomainListEditor list="allowlist" />
                <DomainListEditor list="denylist" />
            </div>
        </Card>
    );
}
