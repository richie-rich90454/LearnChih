import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogContent,
    Input,
    Body1,
    Caption1,
    Badge,
    Divider,
} from "@fluentui/react-components";
import { Search24Regular, Delete24Regular } from "@fluentui/react-icons";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearch } from "@/hooks/useSearch";
import type { SearchResult } from "@/hooks/useSearch";
import { Button } from "./ui/Button";
import { Input as DSInput } from "./ui/Input";
import { Select, Option } from "./ui/Select";
import styles from "./CommandPalette.module.css";

interface BuiltinCommand {
    id: string;
    labelKey: string;
    path: string;
    hintKey: string;
}

const BUILTIN_COMMANDS: BuiltinCommand[] = [
    {
        id: "nav.dashboard",
        labelKey: "nav.dashboard",
        path: "/dashboard",
        hintKey: "commandPalette.hints.dashboard",
    },
    {
        id: "nav.resources",
        labelKey: "nav.resources",
        path: "/resources",
        hintKey: "commandPalette.hints.resources",
    },
    {
        id: "nav.channels",
        labelKey: "nav.channels",
        path: "/channels",
        hintKey: "commandPalette.hints.channels",
    },
    {
        id: "nav.leaderboard",
        labelKey: "nav.leaderboard",
        path: "/leaderboard",
        hintKey: "commandPalette.hints.leaderboard",
    },
    {
        id: "nav.profile",
        labelKey: "nav.profile",
        path: "/profile",
        hintKey: "commandPalette.hints.profile",
    },
];

interface CmdAlias {
    alias: string;
    commandId: string;
}

const ALIASES_KEY = "lernchih-cmd-aliases";

function loadAliases(): CmdAlias[] {
    if (typeof localStorage === "undefined") return [];
    try {
        const raw = localStorage.getItem(ALIASES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (a): a is CmdAlias =>
                typeof a === "object" &&
                a !== null &&
                typeof (a as CmdAlias).alias === "string" &&
                typeof (a as CmdAlias).commandId === "string",
        );
    } catch {
        return [];
    }
}

function saveAliases(aliases: CmdAlias[]): void {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(ALIASES_KEY, JSON.stringify(aliases));
    } catch {
        // Ignore storage errors (e.g. private mode quota).
    }
}

function useCmdAliases() {
    const [aliases, setAliases] = useState<CmdAlias[]>(() => loadAliases());
    useEffect(() => {
        saveAliases(aliases);
    }, [aliases]);
    const addAlias = useCallback((alias: CmdAlias) => {
        setAliases((prev) => {
            const lower = alias.alias.toLowerCase();
            const next = prev.filter((a) => a.alias.toLowerCase() !== lower);
            return [...next, alias];
        });
    }, []);
    const removeAlias = useCallback((aliasText: string) => {
        setAliases((prev) => prev.filter((a) => a.alias !== aliasText));
    }, []);
    return { aliases, addAlias, removeAlias };
}

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * A Cmd/Ctrl+K command palette combining quick navigation shortcuts with
 * live search results. Supports user-defined aliases (F62) stored in
 * localStorage under `lernchih-cmd-aliases`; typing `>` opens an inline
 * alias manager. The parent controls open state and is responsible for
 * registering the global keydown listener (see `useCommandPaletteShortcut`).
 *
 * Spec ref: F2.14, F62.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { aliases, addAlias, removeAlias } = useCmdAliases();

    const showAliasManager = query.startsWith(">");
    const searchQuery = showAliasManager ? "" : query;
    const debouncedQuery = useDebounce(searchQuery, 200);
    const { data, isFetching } = useSearch(debouncedQuery);
    const results: SearchResult[] = data?.content ?? [];

    // Focus the input whenever the dialog opens.
    useEffect(() => {
        if (open) {
            setQuery("");
            // Defer focus until after the surface mounts.
            const id = setTimeout(() => inputRef.current?.focus(), 0);
            return () => clearTimeout(id);
        }
    }, [open]);

    const go = useCallback(
        (path: string) => {
            onOpenChange(false);
            navigate(path);
        },
        [navigate, onOpenChange],
    );

    const goAlias = useCallback(
        (alias: CmdAlias) => {
            const cmd = BUILTIN_COMMANDS.find((c) => c.id === alias.commandId);
            if (cmd) {
                onOpenChange(false);
                navigate(cmd.path);
            }
        },
        [navigate, onOpenChange],
    );

    const matchingAliases = useMemo(() => {
        if (showAliasManager || !query.trim()) return [];
        const q = query.toLowerCase();
        return aliases.filter((a) => a.alias.toLowerCase().includes(q));
    }, [aliases, query, showAliasManager]);

    const showSearch = searchQuery.trim().length > 0;

    return (
        <Dialog
            open={open}
            onOpenChange={(_e, data) => onOpenChange(data.open)}
            modalType="non-modal"
        >
            <DialogSurface className={styles.surface}>
                <DialogBody className={styles.body}>
                    <Input
                        ref={inputRef}
                        className={styles.searchInput}
                        value={query}
                        onChange={(_e, data) => setQuery(data.value)}
                        placeholder={t("commandPalette.placeholder")}
                        contentBefore={<Search24Regular />}
                        aria-label={t("commandPalette.title")}
                    />
                    <DialogContent className={styles.list}>
                        {showAliasManager && (
                            <AliasManager
                                aliases={aliases}
                                onAdd={addAlias}
                                onRemove={removeAlias}
                            />
                        )}

                        {!showAliasManager && !showSearch && (
                            <>
                                <div className={styles.sectionLabel}>
                                    {t("commandPalette.quickNavigation")}
                                </div>
                                {BUILTIN_COMMANDS.map((shortcut) => (
                                    <div
                                        key={shortcut.id}
                                        className={styles.item}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => go(shortcut.path)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") go(shortcut.path);
                                        }}
                                    >
                                        <div className={styles.itemLeft}>
                                            <Body1>{t(shortcut.labelKey)}</Body1>
                                        </div>
                                        <Caption1>{t(shortcut.hintKey)}</Caption1>
                                    </div>
                                ))}
                                <div className={styles.managerHint}>
                                    <Caption1>
                                        {t("commandPalette.aliasManager.hint")}
                                    </Caption1>
                                </div>
                            </>
                        )}

                        {!showAliasManager && showSearch && (
                            <>
                                {matchingAliases.length > 0 && (
                                    <>
                                        <div className={styles.sectionLabel}>
                                            {t("commandPalette.aliasManager.aliasesSection")}
                                        </div>
                                        {matchingAliases.map((alias) => {
                                            const cmd = BUILTIN_COMMANDS.find(
                                                (c) => c.id === alias.commandId,
                                            );
                                            return (
                                                <div
                                                    key={alias.alias}
                                                    className={styles.item}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => goAlias(alias)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") goAlias(alias);
                                                    }}
                                                >
                                                    <div className={styles.itemLeft}>
                                                        <Body1>{alias.alias}</Body1>
                                                        <Caption1>
                                                            {t(
                                                                "commandPalette.aliasManager.aliasFor",
                                                                {
                                                                    label: cmd
                                                                        ? t(cmd.labelKey)
                                                                        : alias.commandId,
                                                                },
                                                            )}
                                                        </Caption1>
                                                    </div>
                                                    <Badge appearance="tint" size="small">
                                                        {t("commandPalette.aliasManager.aliasBadge")}
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                                <div className={styles.sectionLabel}>
                                    {isFetching
                                        ? t("commandPalette.searching")
                                        : t("commandPalette.searchResults")}
                                </div>
                                {!isFetching && results.length === 0 && matchingAliases.length === 0 && (
                                    <div className={styles.empty}>
                                        {t("commandPalette.noResults", { query: debouncedQuery })}
                                    </div>
                                )}
                                {results.map((result) => (
                                    <div
                                        key={`${result.type}-${result.id}`}
                                        className={styles.item}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => go(result.url)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") go(result.url);
                                        }}
                                    >
                                        <div className={styles.itemLeft}>
                                            <Body1>{result.title}</Body1>
                                        </div>
                                        <Badge appearance="tint" size="small">
                                            {result.type}
                                        </Badge>
                                    </div>
                                ))}
                                {results.length > 0 && (
                                    <>
                                        <Divider />
                                        <div className={styles.sectionLabel}>
                                            {t("commandPalette.quickNavigation")}
                                        </div>
                                        {BUILTIN_COMMANDS.map((shortcut) => (
                                            <div
                                                key={shortcut.id}
                                                className={styles.item}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => go(shortcut.path)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") go(shortcut.path);
                                                }}
                                            >
                                                <div className={styles.itemLeft}>
                                                    <Body1>{t(shortcut.labelKey)}</Body1>
                                                </div>
                                                <Caption1>{t(shortcut.hintKey)}</Caption1>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

interface AliasManagerProps {
    aliases: CmdAlias[];
    onAdd: (alias: CmdAlias) => void;
    onRemove: (aliasText: string) => void;
}

function AliasManager({ aliases, onAdd, onRemove }: AliasManagerProps) {
    const { t } = useTranslation();
    const [aliasText, setAliasText] = useState("");
    const [commandId, setCommandId] = useState<string>(
        BUILTIN_COMMANDS[0]?.id ?? "",
    );

    const handleAdd = () => {
        const trimmed = aliasText.trim();
        if (!trimmed || !commandId) return;
        onAdd({ alias: trimmed, commandId });
        setAliasText("");
    };

    return (
        <div className={styles.manager}>
            <div className={styles.sectionLabel}>
                {t("commandPalette.aliasManager.title")}
            </div>
            <div className={styles.managerForm}>
                <DSInput
                    label={t("commandPalette.aliasManager.aliasLabel")}
                    value={aliasText}
                    onChange={(_e, data) => setAliasText(data.value)}
                    placeholder={t("commandPalette.aliasManager.aliasPlaceholder")}
                />
                <Select
                    label={t("commandPalette.aliasManager.commandLabel")}
                    value={commandId}
                    onChange={(_e, data) => setCommandId(data.value)}
                >
                    {BUILTIN_COMMANDS.map((cmd) => (
                        <Option key={cmd.id} value={cmd.id}>
                            {t(cmd.labelKey)}
                        </Option>
                    ))}
                </Select>
                <Button
                    variant="primary"
                    onClick={handleAdd}
                    disabled={!aliasText.trim() || !commandId}
                >
                    {t("commandPalette.aliasManager.add")}
                </Button>
            </div>
            <Divider />
            <div className={styles.sectionLabel}>
                {t("commandPalette.aliasManager.existing")}
            </div>
            {aliases.length === 0 ? (
                <div className={styles.empty}>
                    {t("commandPalette.aliasManager.noAliases")}
                </div>
            ) : (
                aliases.map((alias) => {
                    const cmd = BUILTIN_COMMANDS.find((c) => c.id === alias.commandId);
                    return (
                        <div key={alias.alias} className={styles.aliasRow}>
                            <div className={styles.itemLeft}>
                                <Body1>{alias.alias}</Body1>
                                <Caption1>
                                    {t("commandPalette.aliasManager.aliasFor", {
                                        label: cmd ? t(cmd.labelKey) : alias.commandId,
                                    })}
                                </Caption1>
                            </div>
                            <Button
                                variant="ghost"
                                size="small"
                                icon={<Delete24Regular />}
                                onClick={() => onRemove(alias.alias)}
                                aria-label={t("commandPalette.aliasManager.remove", {
                                    name: alias.alias,
                                })}
                            >
                                {t("common.delete")}
                            </Button>
                        </div>
                    );
                })
            )}
        </div>
    );
}

/**
 * Registers a global Cmd/Ctrl+K listener that toggles the palette open.
 * Returns the current open state and a setter. Drop this into a top-level
 * layout component.
 *
 * Spec ref: F2.14.
 */
export function useCommandPaletteShortcut() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return { open, setOpen } as const;
}

export default CommandPalette;
