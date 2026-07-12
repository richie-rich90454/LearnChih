import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Dropdown,
    Option,
} from "@fluentui/react-components";
import { History24Regular, ArrowNext24Regular } from "@fluentui/react-icons";
import { Button } from "./ui/Button";
import { usePostRevisions, type PostRevision } from "@/store/postRevisionsStore";
import styles from "./RevisionDiffViewer.module.css";

interface RevisionDiffViewerProps {
    postId: number;
}

export type DiffKind = "added" | "removed" | "unchanged";

export interface DiffLine {
    kind: DiffKind;
    text: string;
    oldNumber: number | null;
    newNumber: number | null;
}

/**
 * Computes a line-level diff between two strings using the Longest Common
 * Subsequence (LCS) dynamic programming algorithm.
 *
 * Runs in O(n*m) time and space where n and m are the line counts. Lines are
 * compared by strict equality. The backtrack produces a unified-style diff
 * where removed lines come from `oldText` and added lines come from `newText`.
 */
export function computeDiff(oldText: string, newText: string): DiffLine[] {
    const oldLines = oldText.split("\n");
    const newLines = newText.split("\n");
    const n = oldLines.length;
    const m = newLines.length;

    // dp[i][j] = length of LCS of oldLines[0..i) and newLines[0..j)
    const dp: number[][] = Array.from({ length: n + 1 }, () =>
        new Array<number>(m + 1).fill(0),
    );
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (oldLines[i - 1] === newLines[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to produce the diff.
    const result: DiffLine[] = [];
    let i = n;
    let j = m;
    let oldNum = n;
    let newNum = m;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
            result.unshift({
                kind: "unchanged",
                text: oldLines[i - 1],
                oldNumber: oldNum,
                newNumber: newNum,
            });
            i--;
            j--;
            oldNum--;
            newNum--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            result.unshift({
                kind: "added",
                text: newLines[j - 1],
                oldNumber: null,
                newNumber: newNum,
            });
            j--;
            newNum--;
        } else {
            result.unshift({
                kind: "removed",
                text: oldLines[i - 1],
                oldNumber: oldNum,
                newNumber: null,
            });
            i--;
            oldNum--;
        }
    }
    return result;
}

function formatRevisionLabel(rev: PostRevision): string {
    const date = new Date(rev.editedAt).toLocaleString();
    return `${rev.editorName} \u2014 ${date}`;
}

/**
 * Dialog showing the revision history for a post and a line-by-line diff
 * between two selected revisions (F54). Uses the LCS algorithm above.
 */
export function RevisionDiffViewer({ postId }: RevisionDiffViewerProps) {
    const { t } = useTranslation();
    const revisions = usePostRevisions(postId);
    const [open, setOpen] = useState(false);

    const sorted = useMemo(
        () => [...revisions].sort((a, b) => a.editedAt.localeCompare(b.editedAt)),
        [revisions],
    );

    // Default: compare the two most recent revisions.
    const [fromId, setFromId] = useState<string>("");
    const [toId, setToId] = useState<string>("");

    const effectiveFromId = fromId || (sorted[0]?.id ?? "");
    const effectiveToId = toId || (sorted[sorted.length - 1]?.id ?? "");

    const fromRev = sorted.find((r) => r.id === effectiveFromId);
    const toRev = sorted.find((r) => r.id === effectiveToId);

    const diff = useMemo(() => {
        if (!fromRev || !toRev) return [];
        return computeDiff(fromRev.content, toRev.content);
    }, [fromRev, toRev]);

    const isIdentical =
        diff.length > 0 && diff.every((line) => line.kind === "unchanged");

    return (
        <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
            <DialogTrigger disableButtonEnhancement>
                <Button variant="subtle" size="small" icon={<History24Regular />}>
                    {t("revisionDiff.button", "View revisions")}
                </Button>
            </DialogTrigger>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    <DialogTitle>
                        {t("revisionDiff.title", "Revision history")}
                    </DialogTitle>
                    <DialogContent>
                        <p className={styles.description}>
                            {t(
                                "revisionDiff.description",
                                "Compare two revisions of this post. Lines added are green, lines removed are red.",
                            )}
                        </p>
                        {sorted.length < 2 ? (
                            <p className={styles.empty}>
                                {t(
                                    "revisionDiff.noRevisions",
                                    "No revision history for this post.",
                                )}
                            </p>
                        ) : (
                            <>
                                <div className={styles.selectorRow}>
                                    <span className={styles.selectorLabel}>
                                        {t("revisionDiff.from", "From")}
                                    </span>
                                    <Dropdown
                                        value={fromRev ? formatRevisionLabel(fromRev) : ""}
                                        selectedOptions={
                                            effectiveFromId ? [effectiveFromId] : []
                                        }
                                        onOptionSelect={(_, data) =>
                                            setFromId(data.optionValue ?? "")
                                        }
                                        style={{ minWidth: 220 }}
                                    >
                                        {sorted.map((r) => (
                                            <Option key={r.id} value={r.id}>
                                                {formatRevisionLabel(r)}
                                            </Option>
                                        ))}
                                    </Dropdown>
                                    <span className={styles.arrow}>
                                        <ArrowNext24Regular />
                                    </span>
                                    <span className={styles.selectorLabel}>
                                        {t("revisionDiff.to", "To")}
                                    </span>
                                    <Dropdown
                                        value={toRev ? formatRevisionLabel(toRev) : ""}
                                        selectedOptions={
                                            effectiveToId ? [effectiveToId] : []
                                        }
                                        onOptionSelect={(_, data) =>
                                            setToId(data.optionValue ?? "")
                                        }
                                        style={{ minWidth: 220 }}
                                    >
                                        {sorted.map((r) => (
                                            <Option key={r.id} value={r.id}>
                                                {formatRevisionLabel(r)}
                                            </Option>
                                        ))}
                                    </Dropdown>
                                </div>
                                {isIdentical ? (
                                    <p className={styles.empty}>
                                        {t(
                                            "revisionDiff.identical",
                                            "The selected revisions are identical.",
                                        )}
                                    </p>
                                ) : (
                                    <div
                                        className={styles.diff}
                                        role="region"
                                        aria-label={t("revisionDiff.title", "Revision history")}
                                    >
                                        {diff.map((line, index) => (
                                            <div
                                                key={index}
                                                className={`${styles.line} ${line.kind === "added" ? styles.added : line.kind === "removed" ? styles.removed : styles.unchanged}`}
                                            >
                                                <span className={styles.gutter}>
                                                    {line.kind === "added"
                                                        ? "+"
                                                        : line.kind === "removed"
                                                            ? "-"
                                                            : " "}
                                                </span>
                                                <span className={styles.content}>
                                                    {line.text || "\u00A0"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="subtle" onClick={() => setOpen(false)}>
                            {t("common.close", "Close")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

/**
 * Wrapper that only renders the RevisionDiffViewer trigger when the post has
 * at least two revisions to compare. Safe to use inside a list `.map()`
 * because it calls the hook at the top level.
 */
export function RevisionDiffButton({ postId }: { postId: number }) {
    const revisions = usePostRevisions(postId);
    if (revisions.length < 2) return null;
    return <RevisionDiffViewer postId={postId} />;
}

export default RevisionDiffViewer;
