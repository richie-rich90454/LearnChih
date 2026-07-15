import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    Spinner,
    MessageBar,
    MessageBarBody,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
} from "@fluentui/react-components";
import {
    ArrowUp24Regular,
    ArrowDown24Regular,
    Delete24Regular,
    Play24Regular,
    Add24Regular,
    List24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    getPlaylists,
    getPlaylist,
    createPlaylist,
    deletePlaylist,
    addPlaylistItem,
    removePlaylistItem,
    movePlaylistItem,
    type Playlist,
    type PlaylistItem,
} from "../api/playlists";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import styles from "./PlaylistsPage.module.css";

export default function PlaylistsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [addResourceId, setAddResourceId] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const listQuery = useQuery<Playlist[]>({
        queryKey: ["playlists"],
        queryFn: () => getPlaylists().then((r) => r.data),
    });

    const detailQuery = useQuery({
        queryKey: ["playlist", selectedId],
        queryFn: () => getPlaylist(selectedId!).then((r) => r.data),
        enabled: selectedId !== null,
    });

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ["playlists"] });
        if (selectedId !== null) {
            queryClient.invalidateQueries({ queryKey: ["playlist", selectedId] });
        }
    };

    const createMutation = useMutation({
        mutationFn: () => createPlaylist({ name: newName, description: newDesc }),
        onSuccess: (res) => {
            invalidateAll();
            setCreateOpen(false);
            setNewName("");
            setNewDesc("");
            setSelectedId(res.data.id);
        },
        onError: () => setErrorMsg(t("playlists.createError")),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePlaylist(id),
        onSuccess: () => {
            invalidateAll();
            setSelectedId(null);
        },
    });

    const addItemMutation = useMutation({
        mutationFn: (resourceId: number) => addPlaylistItem(selectedId!, { resourceId }),
        onSuccess: () => {
            invalidateAll();
            setAddResourceId("");
        },
        onError: () => setErrorMsg(t("playlists.createError")),
    });

    const removeItemMutation = useMutation({
        mutationFn: (itemId: number) => removePlaylistItem(selectedId!, itemId),
        onSuccess: () => invalidateAll(),
    });

    const moveMutation = useMutation({
        mutationFn: ({ itemId, direction }: { itemId: number; direction: "up" | "down" }) =>
            movePlaylistItem(selectedId!, itemId, direction),
        onSuccess: () => invalidateAll(),
    });

    const playlists = listQuery.data ?? [];
    const detail = detailQuery.data;
    const items: PlaylistItem[] = detail?.items ?? [];

    const handleCreate = () => {
        if (!newName.trim()) return;
        setErrorMsg(null);
        createMutation.mutate();
    };

    const handleAddItem = () => {
        const rid = Number(addResourceId);
        if (!rid || Number.isNaN(rid)) return;
        setErrorMsg(null);
        addItemMutation.mutate(rid);
    };

    const handlePlay = () => {
        if (items.length === 0) return;
        navigate(`/resources/${items[0].resourceId}`);
    };

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("playlists.title")} — LernChih`}
                description={t("playlists.description")}
                canonicalPath="/playlists"
            />
            <header className={styles.pageHeader}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon}>
                        <List24Regular />
                    </span>
                    <div>
                        <h1 className={styles.title}>{t("playlists.title")}</h1>
                        <p className={styles.subtitle}>{t("playlists.subtitle")}</p>
                    </div>
                </div>
                <Dialog
                    open={createOpen}
                    onOpenChange={(_: unknown, d: { open: boolean }) => setCreateOpen(d.open)}
                >
                    <DialogTrigger disableButtonEnhancement>
                        <Button variant="primary" icon={<Add24Regular />}>
                            {t("playlists.create")}
                        </Button>
                    </DialogTrigger>
                    <DialogSurface>
                        <DialogBody>
                            <DialogTitle>{t("playlists.createTitle")}</DialogTitle>
                            <DialogContent>
                                <div className={styles.form}>
                                    <Input
                                        label={t("playlists.nameLabel")}
                                        placeholder={t("playlists.namePlaceholder")}
                                        value={newName}
                                        onChange={(_, d) => setNewName(d.value)}
                                    />
                                    <Input
                                        label={t("playlists.descriptionLabel")}
                                        placeholder={t("playlists.descriptionPlaceholder")}
                                        value={newDesc}
                                        onChange={(_, d) => setNewDesc(d.value)}
                                    />
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button variant="subtle" onClick={() => setCreateOpen(false)}>
                                    {t("common.cancel")}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleCreate}
                                    disabled={!newName.trim() || createMutation.isPending}
                                    loading={createMutation.isPending}
                                >
                                    {t("common.create")}
                                </Button>
                            </DialogActions>
                        </DialogBody>
                    </DialogSurface>
                </Dialog>
            </header>

            {errorMsg && (
                <MessageBar intent="error">
                    <MessageBarBody>{errorMsg}</MessageBarBody>
                </MessageBar>
            )}

            {listQuery.isError && (
                <ErrorState
                    icon={<List24Regular />}
                    title={t("playlists.errorTitle")}
                    description={t("playlists.errorDescription")}
                    onRetry={() => listQuery.refetch()}
                    retryLabel={t("common.retry")}
                />
            )}

            {listQuery.isLoading && (
                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner label={t("common.loading")} />
                </div>
            )}

            {!listQuery.isLoading && !listQuery.isError && playlists.length === 0 && (
                <EmptyState
                    icon={<List24Regular />}
                    title={t("playlists.emptyTitle")}
                    description={t("playlists.emptyDescription")}
                />
            )}

            <div className={styles.split}>
                <aside className={styles.aside} aria-label={t("playlists.title")}>
                    <div className={styles.listCol}>
                        {playlists.map((p) => (
                            <Card
                                key={p.id}
                                interactive
                                padding="md"
                                className={`${styles.playlistCard} ${
                                    selectedId === p.id ? styles.playlistCardActive : ""
                                }`}
                            >
                                <button
                                    type="button"
                                    className={styles.playlistBtn}
                                    onClick={() => setSelectedId(p.id)}
                                    /* B-ui-188: the playlist list stays visible
                                       while a playlist is selected (visual
                                       highlight via playlistCardActive).
                                       Expose the selected state to assistive
                                       tech via aria-current="true" so screen
                                       readers can announce which playlist is
                                       the currently active one (WCAG 1.3.1
                                       Info and Relationships, 4.1.2 Name,
                                       Role, Value). */
                                    aria-current={selectedId === p.id ? "true" : undefined}
                                >
                                    <span className={styles.playlistName}>{p.name}</span>
                                    <Badge variant="neutral" size="small">
                                        {t("playlists.items", { count: p.itemCount })}
                                    </Badge>
                                </button>
                            </Card>
                        ))}
                    </div>
                </aside>

                <section className={styles.main} aria-label={t("playlists.title")}>
                    {selectedId === null && (
                        <EmptyState
                            icon={<List24Regular />}
                            title={t("playlists.title")}
                            description={t("playlists.emptyDescription")}
                        />
                    )}
                    {selectedId !== null && detailQuery.isLoading && (
                        <div role="status" aria-live="polite">
                            <Spinner label={t("common.loading")} />
                        </div>
                    )}
                    {selectedId !== null && detail && (
                        <Card padding="lg" className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <div>
                                    <h2 className={styles.detailTitle}>{detail.name}</h2>
                                    {detail.description && (
                                        <p className={styles.detailDesc}>{detail.description}</p>
                                    )}
                                </div>
                                <div className={styles.detailActions}>
                                    <Button
                                        variant="primary"
                                        size="small"
                                        icon={<Play24Regular />}
                                        onClick={handlePlay}
                                        disabled={items.length === 0}
                                    >
                                        {t("playlists.play")}
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Delete24Regular />}
                                        onClick={() => deleteMutation.mutate(detail.id)}
                                    >
                                        {t("playlists.deletePlaylist")}
                                    </Button>
                                </div>
                            </div>

                            <div className={styles.addItemRow}>
                                <Input
                                    label={t("playlists.addResourceId")}
                                    value={addResourceId}
                                    onChange={(_, d) => setAddResourceId(d.value)}
                                    type="number"
                                />
                                <Button
                                    variant="outline"
                                    icon={<Add24Regular />}
                                    onClick={handleAddItem}
                                    loading={addItemMutation.isPending}
                                    disabled={!addResourceId.trim()}
                                >
                                    {t("playlists.addItem")}
                                </Button>
                            </div>

                            <div className={styles.itemsList}>
                                {items.length === 0 && (
                                    <p className={styles.emptyItems}>{t("playlists.noItems")}</p>
                                )}
                                {items.map((item, idx) => (
                                    <div key={item.id} className={styles.itemRow}>
                                        <span className={styles.itemIndex}>{idx + 1}</span>
                                        <button
                                            type="button"
                                            className={styles.itemTitle}
                                            onClick={() =>
                                                navigate(`/resources/${item.resourceId}`)
                                            }
                                        >
                                            {item.resourceTitle || `#${item.resourceId}`}
                                        </button>
                                        <div className={styles.itemControls}>
                                            <Tooltip content={t("playlists.moveUp")} relationship="label">
                                                <Button
                                                    variant="subtle"
                                                    size="small"
                                                    icon={<ArrowUp24Regular />}
                                                    disabled={idx === 0 || moveMutation.isPending}
                                                    onClick={() =>
                                                        moveMutation.mutate({
                                                            itemId: item.id,
                                                            direction: "up",
                                                        })
                                                    }
                                                    aria-label={t("playlists.moveUp")}
                                                />
                                            </Tooltip>
                                            <Tooltip content={t("playlists.moveDown")} relationship="label">
                                                <Button
                                                    variant="subtle"
                                                    size="small"
                                                    icon={<ArrowDown24Regular />}
                                                    disabled={
                                                        idx === items.length - 1 ||
                                                        moveMutation.isPending
                                                    }
                                                    onClick={() =>
                                                        moveMutation.mutate({
                                                            itemId: item.id,
                                                            direction: "down",
                                                        })
                                                    }
                                                    aria-label={t("playlists.moveDown")}
                                                />
                                            </Tooltip>
                                            <Tooltip content={t("playlists.removeItem")} relationship="label">
                                                <Button
                                                    variant="subtle"
                                                    size="small"
                                                    icon={<Delete24Regular />}
                                                    onClick={() =>
                                                        removeItemMutation.mutate(item.id)
                                                    }
                                                    aria-label={t("playlists.removeItem")}
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    );
}
