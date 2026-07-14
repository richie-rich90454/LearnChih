import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    Toast,
    ToastTitle,
    useToastController,
} from "@fluentui/react-components";
import { Copy24Regular, Play24Regular } from "@fluentui/react-icons";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./CodeBlock.module.css";

interface CodeBlockProps {
    code: string;
    language?: string;
    filename?: string;
    /** When true, shows a "Run" button that opens the code in a playground. */
    runnable?: boolean;
}

type TokenType = "keyword" | "string" | "comment" | "number" | "function" | "plain";

interface HighlightToken {
    text: string;
    type: TokenType;
}

interface LineToken {
    text: string;
    type: TokenType;
}

const KEYWORDS: Record<string, Set<string>> = {
    javascript: new Set([
        "const", "let", "var", "function", "return", "if", "else", "for",
        "while", "do", "switch", "case", "break", "continue", "new", "class",
        "extends", "super", "this", "typeof", "instanceof", "in", "of", "try",
        "catch", "finally", "throw", "async", "await", "yield", "import",
        "export", "default", "from", "as", "void", "delete", "null", "undefined",
        "true", "false", "static", "get", "set",
    ]),
    typescript: new Set([
        "const", "let", "var", "function", "return", "if", "else", "for",
        "while", "do", "switch", "case", "break", "continue", "new", "class",
        "extends", "super", "this", "typeof", "instanceof", "in", "of", "try",
        "catch", "finally", "throw", "async", "await", "yield", "import",
        "export", "default", "from", "as", "void", "delete", "null", "undefined",
        "true", "false", "static", "get", "set", "interface", "type", "enum",
        "namespace", "declare", "readonly", "public", "private", "protected",
        "abstract", "implements", "keyof", "infer", "is", "satisfies",
    ]),
    python: new Set([
        "def", "class", "return", "if", "elif", "else", "for", "while", "in",
        "not", "and", "or", "is", "None", "True", "False", "import", "from",
        "as", "try", "except", "finally", "raise", "with", "lambda", "yield",
        "global", "nonlocal", "pass", "break", "continue", "assert", "del",
        "async", "await", "self", "cls",
    ]),
    bash: new Set([
        "if", "then", "else", "elif", "fi", "for", "while", "do", "done", "case",
        "esac", "function", "return", "exit", "echo", "export", "local",
        "readonly", "source", "alias", "unset", "set", "shift", "trap",
    ]),
};

function normalizeLanguage(lang?: string): string {
    if (!lang) return "plain";
    const lower = lang.toLowerCase();
    if (lower === "js" || lower === "jsx") return "javascript";
    if (lower === "ts" || lower === "tsx") return "typescript";
    if (lower === "py") return "python";
    if (lower === "sh" || lower === "shell") return "bash";
    return lower;
}

/**
 * Lightweight regex-based syntax highlighter. Returns an array of tokens with
 * types that map to CSS classes. Not a full parser; suitable for short code
 * snippets in forum posts.
 */
function tokenize(code: string, language: string): HighlightToken[] {
    const lang = normalizeLanguage(language);
    const keywords = KEYWORDS[lang];

    interface Match {
        start: number;
        end: number;
        text: string;
        type: TokenType;
    }

    const patterns: { regex: RegExp; type: TokenType }[] = [];

    if (lang === "python" || lang === "bash") {
        patterns.push({ regex: /#.*$/gm, type: "comment" });
    } else if (lang === "javascript" || lang === "typescript") {
        patterns.push({ regex: /\/\/.*$/gm, type: "comment" });
        patterns.push({ regex: /\/\*[\s\S]*?\*\//g, type: "comment" });
    }

    patterns.push({ regex: /"(?:[^"\\]|\\.)*"/g, type: "string" });
    patterns.push({ regex: /'(?:[^'\\]|\\.)*'/g, type: "string" });
    if (lang === "javascript" || lang === "typescript") {
        patterns.push({ regex: /`(?:[^`\\]|\\.)*`/g, type: "string" });
    }
    patterns.push({ regex: /\b\d+(?:\.\d+)?\b/g, type: "number" });

    const allMatches: Match[] = [];
    for (const { regex, type } of patterns) {
        const re = new RegExp(regex.source, regex.flags);
        let m: RegExpExecArray | null;
        while ((m = re.exec(code)) !== null) {
            allMatches.push({
                start: m.index,
                end: m.index + m[0].length,
                text: m[0],
                type,
            });
            if (m[0].length === 0) re.lastIndex++;
        }
    }

    allMatches.sort((a, b) => a.start - b.start);

    const nonOverlapping: Match[] = [];
    let lastEnd = 0;
    for (const match of allMatches) {
        if (match.start >= lastEnd) {
            nonOverlapping.push(match);
            lastEnd = match.end;
        }
    }

    const tokens: HighlightToken[] = [];
    let pos = 0;
    for (const match of nonOverlapping) {
        if (match.start > pos) {
            tokens.push(...tokenizePlain(code.slice(pos, match.start), keywords));
        }
        tokens.push({ text: match.text, type: match.type });
        pos = match.end;
    }
    if (pos < code.length) {
        tokens.push(...tokenizePlain(code.slice(pos), keywords));
    }

    return tokens;
}

function tokenizePlain(text: string, keywords?: Set<string>): HighlightToken[] {
    if (!keywords) return [{ text, type: "plain" }];
    const tokens: HighlightToken[] = [];
    const parts = text.split(/(\b)/);
    for (const part of parts) {
        if (!part) continue;
        if (keywords.has(part)) {
            tokens.push({ text: part, type: "keyword" });
        } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(part)) {
            tokens.push({ text: part, type: "function" });
        } else {
            tokens.push({ text: part, type: "plain" });
        }
    }
    return tokens;
}

/**
 * Splits a flat token list into per-line token lists, preserving multi-line
 * tokens (e.g. block comments) by splitting their text at newlines.
 */
function splitTokensByLine(tokens: HighlightToken[]): LineToken[][] {
    const lines: LineToken[][] = [[]];
    for (const token of tokens) {
        const parts = token.text.split("\n");
        parts.forEach((part, idx) => {
            if (idx > 0) lines.push([]);
            if (part) {
                lines[lines.length - 1].push({ text: part, type: token.type });
            }
        });
    }
    return lines;
}

function getRunUrl(code: string, language: string): string | null {
    const lang = normalizeLanguage(language);
    if (lang === "javascript" || lang === "typescript") {
        const html = `<!DOCTYPE html><html><body><script>\n${code}\n<\/script></body></html>`;
        const blob = new Blob([html], { type: "text/html" });
        return URL.createObjectURL(blob);
    }
    if (lang === "python") return "https://replit.com/languages/python3";
    if (lang === "bash") return "https://www.onlinegdb.com/online_bash_shell";
    return null;
}

const RUNNABLE_LANGUAGES = new Set(["javascript", "typescript", "python", "bash"]);

/**
 * Code block with lightweight syntax highlighting, copy-to-clipboard, and an
 * optional "Run" link that opens the code in a playground (F56). For
 * JavaScript/TypeScript the run button opens a Blob URL that executes the code
 * in a new tab; for Python/Bash it links to the appropriate online REPL.
 *
 * Spec ref: F56.
 */
export function CodeBlock({
    code,
    language = "plain",
    filename,
    runnable = true,
}: CodeBlockProps) {
    const { t } = useTranslation();
    const { dispatchToast } = useToastController("main-toaster");
    const reduced = useReducedMotion();
    const [copied, setCopied] = useState(false);

    const lineTokens = useMemo(
        () => splitTokensByLine(tokenize(code, language)),
        [code, language],
    );

    const lang = normalizeLanguage(language);
    const canRun = runnable && RUNNABLE_LANGUAGES.has(lang);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard?.writeText(code);
            setCopied(true);
            dispatchToast(
                <Toast>
                    <ToastTitle>
                        {t("codeBlock.copied", "Code copied to clipboard")}
                    </ToastTitle>
                </Toast>,
                { intent: "success" },
            );
            setTimeout(() => setCopied(false), 2000);
        } catch {
            dispatchToast(
                <Toast>
                    <ToastTitle>{t("codeBlock.copyFailed", "Failed to copy code")}</ToastTitle>
                </Toast>,
                { intent: "error" },
            );
        }
    }, [code, dispatchToast, t]);

    const handleRun = useCallback(() => {
        const url = getRunUrl(code, language);
        if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
            if (url.startsWith("blob:")) {
                setTimeout(() => URL.revokeObjectURL(url), 60000);
            }
        }
    }, [code, language]);

    return (
        <div
            className={styles.container}
            style={reduced ? { transitionDuration: "0.01ms" } : undefined}
        >
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    {filename && <span className={styles.filename}>{filename}</span>}
                    <Badge variant="neutral" size="small">{lang}</Badge>
                </div>
                <div className={styles.actions}>
                    <Button
                        variant="subtle"
                        size="small"
                        icon={<Copy24Regular />}
                        onClick={handleCopy}
                        aria-label={t("codeBlock.copy", "Copy code")}
                    >
                        {copied
                            ? t("codeBlock.copiedLabel", "Copied")
                            : t("codeBlock.copy", "Copy")}
                    </Button>
                    {canRun && (
                        <Button
                            variant="outline"
                            size="small"
                            icon={<Play24Regular />}
                            onClick={handleRun}
                            aria-label={`${t("codeBlock.run", "Run code")} ${t("a11y.opensInNewWindow")}`}
                        >
                            {t("codeBlock.run", "Run")}
                        </Button>
                    )}
                </div>
            </div>
            <div className={styles.body}>
                <pre className={styles.pre}>
                    <code className={styles.code}>
                        {lineTokens.map((tokens, lineIndex) => (
                            <div key={lineIndex} className={styles.line}>
                                <span className={styles.lineNumber}>{lineIndex + 1}</span>
                                <span className={styles.lineContent}>
                                    {tokens.length === 0 ? (
                                        "\u00A0"
                                    ) : (
                                        tokens.map((token, i) => (
                                            <span
                                                key={i}
                                                className={styles[`token_${token.type}`]}
                                            >
                                                {token.text}
                                            </span>
                                        ))
                                    )}
                                </span>
                            </div>
                        ))}
                    </code>
                </pre>
            </div>
        </div>
    );
}

export default CodeBlock;
