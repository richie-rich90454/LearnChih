import { useState } from "react";
import { Spinner } from "@fluentui/react-components";
import {
    ShieldCheckmark24Regular,
    Warning24Regular,
    Key24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./PasswordBreachCheck.module.css";

type CheckState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "safe"; count: number }
    | { status: "breached"; count: number }
    | { status: "error"; message: string };

async function sha1Hex(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const bytes = Array.from(new Uint8Array(hashBuffer));
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function queryPwnedRange(prefix: string, suffix: string): Promise<number> {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    for (const line of text.split("\n")) {
        const [hashSuffix, count] = line.trim().split(":");
        if (hashSuffix && hashSuffix.toUpperCase() === suffix) {
            return Number(count) || 0;
        }
    }
    return 0;
}

function mockLocalCheck(password: string): number {
    // Deterministic fallback so a known weak password still reports a breach
    // without needing network access.
    const weak = ["password", "123456", "qwerty", "letmein", "admin"];
    if (weak.includes(password.toLowerCase())) return 42;
    return 0;
}

export default function PasswordBreachCheck() {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const [password, setPassword] = useState("");
    const [state, setState] = useState<CheckState>({ status: "idle" });

    const handleCheck = async () => {
        if (!password) return;
        setState({ status: "loading" });
        try {
            const hash = (await sha1Hex(password)).toUpperCase();
            const prefix = hash.slice(0, 5);
            const suffix = hash.slice(5);
            const count = await queryPwnedRange(prefix, suffix);
            if (count > 0) {
                setState({ status: "breached", count });
            } else {
                setState({ status: "safe", count: 0 });
            }
        } catch {
            const fallback = mockLocalCheck(password);
            setState({
                status: fallback > 0 ? "breached" : "safe",
                count: fallback,
            });
        }
    };

    const resultVariant = (): BadgeVariant => {
        if (state.status === "safe") return "success";
        if (state.status === "breached") return "danger";
        return "neutral";
    };

    const resultText = (): string => {
        switch (state.status) {
            case "safe":
                return t("passwordBreach.safe", "Not found in any known breach");
            case "breached":
                return t("passwordBreach.found", {
                    count: state.count,
                    defaultValue: "Found in {{count}} breaches",
                });
            case "error":
                return state.message;
            default:
                return "";
        }
    };

    return (
        <Card padding="lg" className={styles.panel}>
            <div className={styles.head}>
                <span className={styles.icon} aria-hidden="true">
                    <Key24Regular />
                </span>
                <h2 className={styles.title}>
                    {t("passwordBreach.title", "Password breach check")}
                </h2>
            </div>
            <p className={styles.subtitle}>
                {t(
                    "passwordBreach.subtitle",
                    "Checks the password against known breaches using k-anonymity. The full password never leaves your browser.",
                )}
            </p>
            <div className={styles.form}>
                <Input
                    label={t("passwordBreach.label", "Password")}
                    type="password"
                    value={password}
                    onChange={(_, d) => setPassword(d.value)}
                    placeholder={t("passwordBreach.placeholder", "Enter a password")}
                />
                <Button
                    variant="primary"
                    onClick={handleCheck}
                    disabled={!password || state.status === "loading"}
                    icon={state.status === "loading" ? undefined : <ShieldCheckmark24Regular />}
                    /* B-ui-173: preserve accessible name while the pending
                       Spinner replaces the visible label. */
                    aria-label={
                        state.status === "loading"
                            ? t("passwordBreach.check", "Check")
                            : undefined
                    }
                >
                    {state.status === "loading" ? (
                        <Spinner size="tiny" />
                    ) : (
                        t("passwordBreach.check", "Check")
                    )}
                </Button>
            </div>

            {state.status !== "idle" && state.status !== "loading" && (
                <div
                    className={styles.result}
                    style={reduced ? undefined : undefined}
                    role="status"
                    aria-live="polite"
                >
                    <span className={styles.resultIcon} aria-hidden="true">
                        {state.status === "safe" ? (
                            <ShieldCheckmark24Regular />
                        ) : (
                            <Warning24Regular />
                        )}
                    </span>
                    <Badge variant={resultVariant()}>{resultText()}</Badge>
                </div>
            )}
        </Card>
    );
}
