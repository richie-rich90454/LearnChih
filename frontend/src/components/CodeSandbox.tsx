import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@fluentui/react-components";
import { Play24Regular, ArrowReset24Regular, WindowDevTools24Regular } from "@fluentui/react-icons";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./CodeSandbox.module.css";

interface CodeSandboxProps {
    initialCode?: string;
    title?: string;
}

type LogLevel = "log" | "warn" | "error";

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: number;
}

function formatValue(value: unknown): string {
    if (typeof value === "string") return value;
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    if (typeof value === "object") {
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    }
    return String(value);
}

function executeCode(code: string): { logs: LogEntry[]; error: string | null } {
    const logs: LogEntry[] = [];
    let error: string | null = null;

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const now = () => Date.now();

    console.log = (...args: unknown[]) => {
        logs.push({ level: "log", message: args.map(formatValue).join(" "), timestamp: now() });
    };
    console.error = (...args: unknown[]) => {
        logs.push({ level: "error", message: args.map(formatValue).join(" "), timestamp: now() });
    };
    console.warn = (...args: unknown[]) => {
        logs.push({ level: "warn", message: args.map(formatValue).join(" "), timestamp: now() });
    };
    console.info = (...args: unknown[]) => {
        logs.push({ level: "log", message: args.map(formatValue).join(" "), timestamp: now() });
    };

    try {
        const fn = new Function(code);
        const result = fn();
        if (result !== undefined) {
            logs.push({
                level: "log",
                message: `=> ${formatValue(result)}`,
                timestamp: now(),
            });
        }
    } catch (e) {
        error = e instanceof Error ? e.message : String(e);
    } finally {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        console.info = originalInfo;
    }

    return { logs, error };
}

const DEFAULT_CODE = `// Try editing and running this code
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("LernChih"));

const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
`;

/**
 * Live code execution sandbox (F57). Provides an editable code area and a
 * "Run" button that executes JavaScript in-place using `new Function()`.
 * Console output (log/warn/error) is captured and displayed below. The
 * sandbox is client-side; it captures console methods during execution and
 * restores them afterward.
 *
 * Spec ref: F57.
 */
export function CodeSandbox({ initialCode = DEFAULT_CODE, title }: CodeSandboxProps) {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const [code, setCode] = useState(initialCode);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [running, setRunning] = useState(false);

    const handleRun = useCallback(() => {
        setRunning(true);
        // Defer to next tick so the spinner can render.
        setTimeout(() => {
            const result = executeCode(code);
            setLogs(result.logs);
            setError(result.error);
            setRunning(false);
        }, 0);
    }, [code]);

    const handleClear = useCallback(() => {
        setLogs([]);
        setError(null);
    }, []);

    const hasOutput = logs.length > 0 || error !== null;

    const lineCount = useMemo(() => code.split("\n").length, [code]);

    return (
        <div
            className={styles.container}
            style={reduced ? { transitionDuration: "0.01ms" } : undefined}
        >
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <WindowDevTools24Regular className={styles.headerIcon} />
                    {title && <span className={styles.title}>{title}</span>}
                    <Badge variant="accent" size="small">JavaScript</Badge>
                </div>
                <div className={styles.actions}>
                    <Button
                        variant="subtle"
                        size="small"
                        icon={<ArrowReset24Regular />}
                        onClick={handleClear}
                        disabled={!hasOutput}
                        aria-label={t("codeSandbox.clear", "Clear output")}
                    >
                        {t("codeSandbox.clear", "Clear")}
                    </Button>
                    <Button
                        variant="primary"
                        size="small"
                        icon={<Play24Regular />}
                        onClick={handleRun}
                        disabled={running || !code.trim()}
                        aria-label={t("codeSandbox.run", "Run code")}
                    >
                        {t("codeSandbox.run", "Run")}
                    </Button>
                </div>
            </div>
            <div className={styles.editorWrapper}>
                <Textarea
                    value={code}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCode(e.target.value)
                    }
                    className={styles.editor}
                    spellCheck={false}
                    resize="vertical"
                    aria-label={t("codeSandbox.editorLabel", "Code editor")}
                    rows={Math.min(Math.max(lineCount + 1, 6), 20)}
                />
            </div>
            {hasOutput && (
                <div className={styles.output} role="region" aria-label={t("codeSandbox.output", "Console output")}>
                    <div className={styles.outputHeader}>
                        {t("codeSandbox.output", "Console output")}
                    </div>
                    <div className={styles.outputBody}>
                        {error && (
                            <div className={styles.errorLine}>
                                <span className={styles.errorPrefix}>Error: </span>
                                {error}
                            </div>
                        )}
                        {logs.map((entry, i) => (
                            <div key={i} className={styles[`${entry.level}Line`]}>
                                <span className={styles.linePrefix}>
                                    {entry.level === "error" ? "!" : entry.level === "warn" ? "*" : ">"}
                                </span>
                                <pre className={styles.logText}>{entry.message}</pre>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CodeSandbox;
