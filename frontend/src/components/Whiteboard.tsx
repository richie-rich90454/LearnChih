import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    Spinner,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@fluentui/react-components";
import {
    Whiteboard24Regular,
    Pen24Regular,
    Add24Regular,
    Delete24Regular,
    ArrowUndo24Regular,
    Save24Regular,
    Eraser24Regular,
} from "@fluentui/react-icons";
import {
    useWhiteboards,
    useCreateWhiteboard,
    useUpdateWhiteboard,
    useDeleteWhiteboard,
} from "../hooks/useWhiteboards";
import type { Whiteboard } from "../api/whiteboards";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";
import styles from "./Whiteboard.module.css";

interface Point {
    x: number;
    y: number;
}

interface Stroke {
    points: Point[];
    color: string;
    width: number;
}

const COLORS = [
    "#1f1f1f",
    "#0f6cbd",
    "#107c10",
    "#c19c00",
    "#d13438",
    "#8764b8",
];

const WIDTHS = [2, 4, 8];

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

function parseStrokes(content: string | null): Stroke[] {
    if (!content) return [];
    try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed as Stroke[];
        return [];
    } catch {
        return [];
    }
}

function serializeStrokes(strokes: Stroke[]): string {
    return JSON.stringify(strokes);
}

function formatUpdated(iso: string): string {
    try {
        return new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

interface WhiteboardsProps {
    groupId: number;
}

export function Whiteboards({ groupId }: WhiteboardsProps) {
    const { t } = useTranslation();
    const { data: boards, isLoading, isError, refetch } = useWhiteboards(groupId);
    const createMutation = useCreateWhiteboard(groupId);
    const deleteMutation = useDeleteWhiteboard(groupId);

    const [createOpen, setCreateOpen] = useState(false);
    const [editBoard, setEditBoard] = useState<Whiteboard | null>(null);

    const list = boards ?? [];

    const handleDelete = (id: number) => {
        if (window.confirm(t("whiteboards.deleteConfirm"))) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className={styles.panel}>
            <header className={styles.panelHeader}>
                <div>
                    <h2 className={styles.panelTitle}>{t("whiteboards.title")}</h2>
                    <p className={styles.panelSubtitle}>{t("whiteboards.subtitle")}</p>
                </div>
                <Button
                    variant="primary"
                    size="small"
                    icon={<Add24Regular />}
                    onClick={() => setCreateOpen(true)}
                >
                    {t("whiteboards.createButton")}
                </Button>
            </header>

            {isLoading && (
                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner label={t("common.loading")} />
                </div>
            )}
            {isError && (
                <ErrorState
                    icon={<Whiteboard24Regular />}
                    title={t("whiteboards.errorTitle")}
                    description={t("whiteboards.errorDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("common.retry")}
                />
            )}
            {!isLoading && !isError && list.length === 0 && (
                <EmptyState
                    icon={<Whiteboard24Regular />}
                    title={t("whiteboards.noBoards")}
                    description={t("whiteboards.subtitle")}
                />
            )}

            <div className={styles.boardList}>
                {list.map((board) => (
                    <Card key={board.id} padding="md" className={styles.boardCard}>
                        <div className={styles.boardTop}>
                            <h3 className={styles.boardTitle}>{board.title}</h3>
                            <Badge variant="neutral" size="small">
                                {formatUpdated(board.updatedAt)}
                            </Badge>
                        </div>
                        <div className={styles.boardMeta}>
                            <span className={styles.boardCreator}>
                                {t("common.byAuthor", { author: board.creatorName })}
                            </span>
                        </div>
                        <div className={styles.boardActions}>
                            <Button
                                variant="primary"
                                size="small"
                                icon={<Pen24Regular />}
                                onClick={() => setEditBoard(board)}
                            >
                                {t("whiteboards.open")}
                            </Button>
                            <Button
                                variant="ghost"
                                size="small"
                                icon={<Delete24Regular />}
                                onClick={() => handleDelete(board.id)}
                            >
                                {t("whiteboards.deleteBoard")}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <CreateBoardDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreate={(title) => {
                    createMutation.mutate(
                        { title },
                        {
                            onSuccess: (created) => {
                                setCreateOpen(false);
                                setEditBoard(created.data);
                            },
                        },
                    );
                }}
                loading={createMutation.isPending}
                error={createMutation.isError ? t("whiteboards.createError") : undefined}
                t={t}
            />

            <EditorDialog
                board={editBoard}
                groupId={groupId}
                onClose={() => setEditBoard(null)}
                t={t}
            />
        </div>
    );
}

interface CreateBoardDialogProps {
    open: boolean;
    onClose: () => void;
    onCreate: (title: string) => void;
    loading: boolean;
    error?: string;
    t: ReturnType<typeof useTranslation>["t"];
}

function CreateBoardDialog({
    open,
    onClose,
    onCreate,
    loading,
    error,
    t,
}: CreateBoardDialogProps) {
    const [title, setTitle] = useState("");

    useEffect(() => {
        if (open) setTitle("");
    }, [open]);

    const handleSubmit = () => {
        if (!title.trim()) return;
        onCreate(title.trim());
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(_, data) => {
                if (!data.open) onClose();
            }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>{t("whiteboards.createTitle")}</DialogTitle>
                    <DialogContent>
                        <div className={styles.form}>
                            <Input
                                label={t("whiteboards.fieldTitle")}
                                placeholder={t("whiteboards.fieldTitlePlaceholder")}
                                value={title}
                                onChange={(_, d) => setTitle(d.value)}
                            />
                            {error && (
                                <p className={styles.formError} role="alert">
                                    {error}
                                </p>
                            )}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="subtle" onClick={onClose}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            loading={loading}
                            disabled={!title.trim()}
                            onClick={handleSubmit}
                        >
                            {t("whiteboards.createConfirm")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

interface EditorDialogProps {
    board: Whiteboard | null;
    groupId: number;
    onClose: () => void;
    t: ReturnType<typeof useTranslation>["t"];
}

function EditorDialog({ board, groupId, onClose, t }: EditorDialogProps) {
    const updateMutation = useUpdateWhiteboard(groupId);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [color, setColor] = useState(COLORS[0]);
    const [width, setWidth] = useState(WIDTHS[1]);
    const [isErasing, setIsErasing] = useState(false);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const drawingRef = useRef(false);
    const currentStrokeRef = useRef<Stroke | null>(null);

    useEffect(() => {
        if (board) {
            setStrokes(parseStrokes(board.content));
        }
    }, [board]);

    const open = board != null;

    const getPoint = useCallback((e: React.PointerEvent<SVGSVGElement>): Point => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        return {
            x: Math.round((e.clientX - rect.left) * scaleX),
            y: Math.round((e.clientY - rect.top) * scaleY),
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
        e.preventDefault();
        (e.target as Element).setPointerCapture(e.pointerId);
        drawingRef.current = true;
        const pt = getPoint(e);
        if (isErasing) {
            currentStrokeRef.current = {
                points: [pt],
                color: "#ffffff",
                width: width * 4,
            };
        } else {
            currentStrokeRef.current = { points: [pt], color, width };
        }
        setStrokes((prev) => [...prev, currentStrokeRef.current!]);
    };

    const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
        if (!drawingRef.current || !currentStrokeRef.current) return;
        e.preventDefault();
        const pt = getPoint(e);
        currentStrokeRef.current.points.push(pt);
        setStrokes((prev) => [...prev.slice(0, -1), { ...currentStrokeRef.current! }]);
    };

    const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
        if (!drawingRef.current) return;
        e.preventDefault();
        drawingRef.current = false;
        currentStrokeRef.current = null;
    };

    const handleUndo = () => {
        setStrokes((prev) => prev.slice(0, -1));
    };

    const handleClear = () => {
        setStrokes([]);
    };

    const handleSave = () => {
        if (!board) return;
        updateMutation.mutate({
            id: board.id,
            data: { content: serializeStrokes(strokes) },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(_, data) => {
                if (!data.open) onClose();
            }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>
                        {board ? `${t("whiteboards.editorTitle")} — ${board.title}` : t("whiteboards.editorTitle")}
                    </DialogTitle>
                    <DialogContent>
                        <div className={styles.toolbar}>
                            <div className={styles.toolGroup}>
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={
                                            !isErasing && color === c
                                                ? `${styles.swatch} ${styles.swatchActive}`
                                                : styles.swatch
                                        }
                                        style={{ backgroundColor: c }}
                                        onClick={() => {
                                            setColor(c);
                                            setIsErasing(false);
                                        }}
                                        aria-label={t("whiteboards.color")}
                                    />
                                ))}
                            </div>
                            <div className={styles.toolGroup}>
                                {WIDTHS.map((w) => (
                                    <button
                                        key={w}
                                        type="button"
                                        className={
                                            width === w
                                                ? `${styles.widthBtn} ${styles.widthBtnActive}`
                                                : styles.widthBtn
                                        }
                                        onClick={() => setWidth(w)}
                                        aria-label={t("whiteboards.strokeWidth")}
                                    >
                                        <span
                                            className={styles.widthDot}
                                            style={{ width: w * 2, height: w * 2 }}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className={styles.toolGroup}>
                                <Button
                                    variant={isErasing ? "primary" : "outline"}
                                    size="small"
                                    icon={<Eraser24Regular />}
                                    onClick={() => setIsErasing((v) => !v)}
                                >
                                    {t("whiteboards.eraser")}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="small"
                                    icon={<ArrowUndo24Regular />}
                                    onClick={handleUndo}
                                    disabled={strokes.length === 0}
                                >
                                    {t("whiteboards.undo")}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={handleClear}
                                    disabled={strokes.length === 0}
                                >
                                    {t("whiteboards.clear")}
                                </Button>
                            </div>
                        </div>
                        <div className={styles.canvasWrap}>
                            <svg
                                ref={svgRef}
                                className={styles.canvas}
                                viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                                preserveAspectRatio="xMidYMid meet"
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerLeave={handlePointerUp}
                            >
                                <rect
                                    x={0}
                                    y={0}
                                    width={CANVAS_WIDTH}
                                    height={CANVAS_HEIGHT}
                                    fill="#ffffff"
                                />
                                {strokes.map((stroke, idx) => {
                                    const pts = stroke.points
                                        .map((p) => `${p.x},${p.y}`)
                                        .join(" ");
                                    return (
                                        <polyline
                                            key={idx}
                                            points={pts}
                                            fill="none"
                                            stroke={stroke.color}
                                            strokeWidth={stroke.width}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                        {updateMutation.isError && (
                            <p className={styles.formError} role="alert">
                                {t("whiteboards.saveError")}
                            </p>
                        )}
                        {updateMutation.isSuccess && (
                            <p className={styles.savedHint} role="status">
                                {t("whiteboards.saved")}
                            </p>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="subtle" onClick={onClose}>
                            {t("common.close")}
                        </Button>
                        <Button
                            variant="primary"
                            icon={<Save24Regular />}
                            loading={updateMutation.isPending}
                            onClick={handleSave}
                        >
                            {t("whiteboards.save")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
