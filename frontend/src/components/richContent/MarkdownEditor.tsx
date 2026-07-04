import { useRef, useState, useCallback } from "react";
import {
    Button,
    Textarea,
    makeStyles,
    tokens,
    Divider,
    Caption1,
} from "@fluentui/react-components";
import {
    TextBold24Regular,
    TextItalic24Regular,
    Link24Regular,
    Image24Regular,
    Code24Regular,
    Eye24Regular,
    Edit24Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    toolbar: {
        display: "flex",
        gap: tokens.spacingHorizontalXS,
        alignItems: "center",
        flexWrap: "wrap",
    },
    textarea: {
        minHeight: "260px",
        fontFamily: "monospace",
    },
    preview: {
        minHeight: "260px",
        padding: tokens.spacingHorizontalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        overflowX: "auto",
        lineHeight: "1.6",
        "& h1": { fontSize: "var(--fontSizeHero700)" },
        "& h2": { fontSize: "var(--fontSizeHero500)" },
        "& h3": { fontSize: "var(--fontSizeBase500)" },
        "& a": { color: tokens.colorBrandForegroundLink },
        "& pre": {
            padding: tokens.spacingHorizontalM,
            background: tokens.colorNeutralBackground2,
            borderRadius: tokens.borderRadiusMedium,
            overflowX: "auto",
        },
        "& code": { fontFamily: "monospace" },
        "& img": { maxWidth: "100%", height: "auto" },
    },
});

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

/**
 * A best-effort, dependency-free markdown → HTML renderer used only for the
 * in-app preview. The server-side OWASP HtmlSanitizer is the source of truth
 * for stored content, so this intentionally supports a small subset.
 */
function renderMarkdown(md: string): string {
    let html = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Fenced code blocks first so their contents are not re-processed.
    html = html.replace(
        /```([\s\S]*?)```/g,
        (_m, code: string) => `<pre><code>${code}</code></pre>`,
    );
    // Images: ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
    // Links: [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // Italic
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    // Headings
    html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    // Line breaks
    html = html.replace(/\n/g, "<br/>");
    return html;
}

/**
 * Textarea-based Markdown editor with a formatting toolbar and preview toggle.
 * Spec refs: F1.1–F1.7.
 */
export function MarkdownEditor({
    value,
    onChange,
    placeholder = "Write in Markdown...",
}: MarkdownEditorProps) {
    const styles = useStyles();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [mode, setMode] = useState<"edit" | "preview">("edit");

    const wrapSelection = useCallback(
        (before: string, after: string = before, placeholderText = "") => {
            const el = textareaRef.current;
            if (!el) return;
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const selected = value.slice(start, end) || placeholderText;
            const next = value.slice(0, start) + before + selected + after + value.slice(end);
            onChange(next);
            // Restore focus and selection after React updates the textarea.
            requestAnimationFrame(() => {
                el.focus();
                el.setSelectionRange(
                    start + before.length,
                    start + before.length + selected.length,
                );
            });
        },
        [value, onChange],
    );

    const insertAtCursor = useCallback(
        (snippet: string) => {
            const el = textareaRef.current;
            if (!el) return;
            const start = el.selectionStart;
            const next = value.slice(0, start) + snippet + value.slice(start);
            onChange(next);
            requestAnimationFrame(() => {
                el.focus();
                el.setSelectionRange(start + snippet.length, start + snippet.length);
            });
        },
        [value, onChange],
    );

    return (
        <div className={styles.root}>
            <div className={styles.toolbar}>
                <Button
                    size="small"
                    appearance="subtle"
                    icon={<TextBold24Regular />}
                    title="Bold"
                    aria-label="Bold"
                    onClick={() => wrapSelection("**", "**", "bold text")}
                />
                <Button
                    size="small"
                    appearance="subtle"
                    icon={<TextItalic24Regular />}
                    title="Italic"
                    aria-label="Italic"
                    onClick={() => wrapSelection("*", "*", "italic text")}
                />
                <Button
                    size="small"
                    appearance="subtle"
                    icon={<Link24Regular />}
                    title="Link"
                    aria-label="Insert link"
                    onClick={() => wrapSelection("[", "](https://)", "link text")}
                />
                <Button
                    size="small"
                    appearance="subtle"
                    icon={<Image24Regular />}
                    title="Image"
                    aria-label="Insert image"
                    onClick={() => insertAtCursor("\n![alt text](https://image-url)\n")}
                />
                <Button
                    size="small"
                    appearance="subtle"
                    icon={<Code24Regular />}
                    title="Code block"
                    aria-label="Insert code block"
                    onClick={() => insertAtCursor("\n```\ncode\n```\n")}
                />
                <Divider vertical style={{ height: "24px" }} />
                <Button
                    size="small"
                    appearance={mode === "edit" ? "primary" : "subtle"}
                    icon={<Edit24Regular />}
                    onClick={() => setMode("edit")}
                >
                    Write
                </Button>
                <Button
                    size="small"
                    appearance={mode === "preview" ? "primary" : "subtle"}
                    icon={<Eye24Regular />}
                    onClick={() => setMode("preview")}
                >
                    Preview
                </Button>
            </div>

            {mode === "edit" ? (
                <Textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    value={value}
                    onChange={(_e, data) => onChange(data.value)}
                    placeholder={placeholder}
                    resize="vertical"
                />
            ) : (
                <div>
                    <div
                        className={styles.preview}
                        dangerouslySetInnerHTML={{
                            __html: value.trim()
                                ? renderMarkdown(value)
                                : "<em>Nothing to preview yet.</em>",
                        }}
                    />
                    <Caption1>
                        Preview is a lightweight render; the server sanitizes stored content via
                        OWASP HtmlSanitizer.
                    </Caption1>
                </div>
            )}
        </div>
    );
}

export default MarkdownEditor;
