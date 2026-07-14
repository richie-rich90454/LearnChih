import { useRef, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Spinner, MessageBar, MessageBarBody, MessageBarTitle } from "@fluentui/react-components";
import {
    getConceptMap,
    addConceptMapNode,
    saveConceptMapLayout,
    deleteConceptMapNode,
    type ConceptMapNode,
    type ConceptMapEdge,
    type ConceptMapData,
} from "@/api/conceptMap";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import styles from "./ConceptMap.module.css";

interface ConceptMapProps {
    subjectId: number;
}

const SVG_WIDTH = 880;
const SVG_HEIGHT = 520;
const NODE_RADIUS = 30;
const LABEL_OFFSET = 50;

/**
 * Per-subject concept map (F6). Renders an SVG canvas with draggable labeled
 * nodes connected by directed edges. Users can add nodes (optionally linked to
 * a parent), rearrange them by dragging, persist the new layout, and remove
 * nodes. Backed by /api/subjects/{subjectId}/concept-map.
 */
export default function ConceptMap({ subjectId }: ConceptMapProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const svgRef = useRef<SVGSVGElement>(null);

    const queryKey = useMemo(() => ["concept-map", subjectId] as const, [subjectId]);

    const { data, isLoading, isError } = useQuery({
        queryKey,
        queryFn: () => getConceptMap(subjectId).then((r) => r.data),
    });

    const [label, setLabel] = useState("");
    const [parentId, setParentId] = useState<string>("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [dragId, setDragId] = useState<number | null>(null);
    const [liveNodes, setLiveNodes] = useState<ConceptMapNode[] | null>(null);

    const nodes = liveNodes ?? data?.nodes ?? [];
    const edges = data?.edges ?? [];

    const addMutation = useMutation({
        mutationFn: (req: { label: string; parentId: number | null }) =>
            addConceptMapNode(subjectId, {
                label: req.label,
                posX: 120 + Math.random() * 200,
                posY: 120 + Math.random() * 160,
                parentId: req.parentId,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            setLabel("");
            setParentId("");
        },
    });

    const saveMutation = useMutation({
        mutationFn: () =>
            saveConceptMapLayout(subjectId, {
                nodes: nodes.map((n) => ({ id: n.id, posX: n.posX, posY: n.posY })),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            setLiveNodes(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (nodeId: number) => deleteConceptMapNode(subjectId, nodeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            setSelectedId(null);
        },
    });

    const clientToSvg = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const sp = pt.matrixTransform(ctm.inverse());
        return { x: sp.x, y: sp.y };
    };

    const handlePointerDown = (e: React.PointerEvent, node: ConceptMapNode) => {
        e.preventDefault();
        (e.target as Element).setPointerCapture(e.pointerId);
        if (liveNodes === null) setLiveNodes(nodes.map((n) => ({ ...n })));
        setDragId(node.id);
        setSelectedId(node.id);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (dragId === null || liveNodes === null) return;
        const { x, y } = clientToSvg(e.clientX, e.clientY);
        setLiveNodes((prev) =>
            prev
                ? prev.map((n) =>
                      n.id === dragId
                          ? {
                                ...n,
                                posX: Math.max(
                                    NODE_RADIUS,
                                    Math.min(SVG_WIDTH - NODE_RADIUS, x),
                                ),
                                posY: Math.max(
                                    NODE_RADIUS,
                                    Math.min(SVG_HEIGHT - NODE_RADIUS - 20, y),
                                ),
                            }
                          : n,
                  )
                : prev,
        );
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (dragId !== null) {
            (e.target as Element).releasePointerCapture?.(e.pointerId);
        }
        setDragId(null);
    };

    const handleAdd = () => {
        const trimmed = label.trim();
        if (!trimmed) return;
        addMutation.mutate({
            label: trimmed,
            parentId: parentId ? Number(parentId) : null,
        });
    };

    const handleSave = () => {
        saveMutation.mutate();
    };

    const handleDelete = () => {
        if (selectedId !== null) {
            deleteMutation.mutate(selectedId);
        }
    };

    const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
    const dirty = liveNodes !== null;

    if (isLoading) {
        return (
            <div className={styles.stateWrap}>
                <Spinner size="large" />
            </div>
        );
    }

    if (isError) {
        return (
            <MessageBar intent="error">
                <MessageBarBody>
                    <MessageBarTitle>{t("conceptMap.error")}</MessageBarTitle>
                </MessageBarBody>
            </MessageBar>
        );
    }

    return (
        <div className={styles.wrap}>
            <div className={styles.toolbar}>
                <Input
                    className={styles.labelInput}
                    placeholder={t("conceptMap.nodeLabel")}
                    value={label}
                    onChange={(_, d) => setLabel(d.value)}
                    wrapperClassName={styles.labelField}
                    aria-label={t("conceptMap.nodeLabel")}
                />
                <Select
                    className={styles.parentSelect}
                    value={parentId}
                    onChange={(_, d) => setParentId(d.value as string)}
                    aria-label={t("conceptMap.parentLabel")}
                >
                    <Option value="">{t("conceptMap.parentLabel")}</Option>
                    {nodes.map((n) => (
                        <Option key={n.id} value={String(n.id)}>
                            {n.label}
                        </Option>
                    ))}
                </Select>
                <Button
                    variant="primary"
                    onClick={handleAdd}
                    loading={addMutation.isPending}
                    disabled={!label.trim()}
                >
                    {t("conceptMap.addNode")}
                </Button>
                <Button
                    variant="outline"
                    onClick={handleSave}
                    loading={saveMutation.isPending}
                    disabled={!dirty}
                    className={styles.saveBtn}
                >
                    {t("conceptMap.save")}
                </Button>
            </div>

            <div className={styles.canvasRow}>
                <svg
                    ref={svgRef}
                    className={styles.canvas}
                    viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    role="img"
                    aria-label={t("conceptMap.title")}
                >
                    {nodes.length === 0 && (
                        <text
                            x={SVG_WIDTH / 2}
                            y={SVG_HEIGHT / 2}
                            textAnchor="middle"
                            className={styles.emptyText}
                        >
                            {t("conceptMap.empty")}
                        </text>
                    )}
                    {edges.map((edge: ConceptMapEdge) => {
                        const source = nodes.find((n) => n.id === edge.sourceId);
                        const target = nodes.find((n) => n.id === edge.targetId);
                        if (!source || !target) return null;
                        return (
                            <line
                                key={edge.id}
                                x1={source.posX}
                                y1={source.posY}
                                x2={target.posX}
                                y2={target.posY}
                                className={styles.edge}
                            />
                        );
                    })}
                    {nodes.map((node) => {
                        const active = node.id === selectedId;
                        return (
                            <g
                                key={node.id}
                                className={styles.nodeGroup}
                                onPointerDown={(e) => handlePointerDown(e, node)}
                                style={{ cursor: dragId === node.id ? "grabbing" : "grab" }}
                            >
                                <circle
                                    cx={node.posX}
                                    cy={node.posY}
                                    r={NODE_RADIUS}
                                    className={active ? styles.nodeActive : styles.node}
                                />
                                <text
                                    x={node.posX}
                                    y={node.posY + LABEL_OFFSET}
                                    textAnchor="middle"
                                    className={styles.nodeLabel}
                                >
                                    {node.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                <Card padding="md" className={styles.details}>
                    <div className={styles.detailsHeader}>
                        <Badge variant="accent">{t("conceptMap.details")}</Badge>
                    </div>
                    {selectedNode ? (
                        <div className={styles.detailsBody}>
                            <p className={styles.detailsLabel}>{selectedNode.label}</p>
                            <p className={styles.detailsMeta}>
                                x: {Math.round(selectedNode.posX)} · y:{" "}
                                {Math.round(selectedNode.posY)}
                            </p>
                            <Button
                                variant="ghost"
                                onClick={handleDelete}
                                loading={deleteMutation.isPending}
                                className={styles.deleteBtn}
                            >
                                {t("common.delete")}
                            </Button>
                        </div>
                    ) : (
                        <p className={styles.detailsEmpty}>{t("conceptMap.selectNode")}</p>
                    )}
                </Card>
            </div>
            {saveMutation.isSuccess && (
                <p className={styles.savedNote} role="status">
                    {t("conceptMap.saved")}
                </p>
            )}
        </div>
    );
}
