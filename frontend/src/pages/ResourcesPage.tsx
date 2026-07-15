import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
    Input,
    Textarea,
    Select,
    Field,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Spinner,
    MessageBar,
    MessageBarBody,
    Tooltip,
} from "@fluentui/react-components";
import {
    Add24Regular,
    Link24Regular,
    Bookmark24Regular,
    Bookmark24Filled,
    Document24Regular,
} from "@fluentui/react-icons";
import { useResources, useCreateResource } from "@/hooks/useResources";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslation } from "react-i18next";
import type { Resource } from "@/types";
import Seo from "@/components/Seo";
import { Pagination } from "@/components/Pagination";
import { TagList } from "@/components/TagBadge";
import { StaggerReveal } from "@/components/StaggerReveal";
import { HoverLift } from "@/components/HoverLift";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useBookmarkStore } from "@/store/bookmarkStore";
import useAuthStore from "@/store/authStore";
import styles from "./List.module.css";

const CATEGORIES = ["NOTES", "PAST_PAPER", "TEXTBOOK", "TUTORIAL", "OTHER"];
const SUBJECTS = [
    "Mathematics",
    "Physics",
    "Computer Science",
    "Chemistry",
    "Biology",
    "Economics",
    "English",
    "History",
    "Other",
];

export default function ResourcesPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const hasQueryParams = searchParams.has("q") || searchParams.has("page");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [subjectFilter, setSubjectFilter] = useState<string>("");
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    // Upload form state
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [category, setCategory] = useState<string>("NOTES");
    const [resourceType, setResourceType] = useState<string>("UPLOAD");
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState<string>("");
    const [subject, setSubject] = useState<string>("");
    const [topic, setTopic] = useState<string>("");
    const [course, setCourse] = useState<string>("");

    const params: Record<string, string> = {};
    if (categoryFilter) params.category = categoryFilter;
    if (subjectFilter) params.subject = subjectFilter;

    const { data, isLoading, isError, refetch } = useResources(params);
    const createMutation = useCreateResource();
    const { isAuthenticated } = useAuthStore();
    const authenticated = isAuthenticated();

    const resources: Resource[] = Array.isArray(data) ? data : (data as any)?.content || [];
    const { toggleBookmark, isBookmarked } = useBookmarkStore();

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "upvoted">("newest");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const debouncedSearch = useDebounce(searchQuery, 250);
    const PAGE_SIZE = 9;

    const filteredResources = useMemo(() => {
        return resources.filter((r) => {
            if (!debouncedSearch) return true;
            const q = debouncedSearch.toLowerCase();
            return (
                r.title?.toLowerCase().includes(q) ||
                r.description?.toLowerCase().includes(q) ||
                r.authorName?.toLowerCase().includes(q)
            );
        });
    }, [resources, debouncedSearch]);

    const sortedResources = useMemo(() => {
        const arr = [...filteredResources];
        if (sortBy === "newest") {
            arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === "oldest") {
            arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else {
            arr.sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0));
        }
        return arr;
    }, [filteredResources, sortBy]);

    const totalPages = Math.ceil(sortedResources.length / PAGE_SIZE);
    const paginatedResources = sortedResources.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const prevPath =
        currentPage > 1 && totalPages > 1 ? `/resources?page=${currentPage - 1}` : undefined;
    const nextPath =
        currentPage < totalPages && totalPages > 1
            ? `/resources?page=${currentPage + 1}`
            : undefined;

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, sortBy, categoryFilter, subjectFilter]);

    // axe-core's color-contrast rule cannot resolve CSS custom properties
    // (var(--colorXxx)) set by FluentProvider via Griffel. For <select>
    // elements, Fluent UI v9 does not forward the `style` prop, and global
    // CSS with `!important` is overridden by Griffel's runtime-injected
    // atomic classes in some browser/axe-core combinations. This useEffect
    // sets inline styles with `!important` via JavaScript, which has the
    // highest specificity and is guaranteed to override all CSS rules.
    useEffect(() => {
        const darkMode =
            typeof window !== "undefined" && window.matchMedia
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                : false;
        const setColor = darkMode ? "#FFFFFF" : "#0E2861";
        const setBg = darkMode ? "#1A1A1A" : "#FFFFFF";
        const apply = () => {
            document.querySelectorAll<HTMLElement>(".fui-Select__select").forEach((el) => {
                el.style.setProperty("color", setColor, "important");
                el.style.setProperty("background-color", setBg, "important");
            });
        };
        apply();
        // Re-apply after a tick in case Griffel injects styles asynchronously.
        const timer = window.setTimeout(apply, 100);
        return () => window.clearTimeout(timer);
    }, []);

    const handleCreate = () => {
        const formData: Record<string, unknown> = {
            title,
            description,
            category,
            type: resourceType,
            subject,
            topic,
            course,
        };
        if (resourceType === "UPLOAD" && file) {
            formData.file = file;
        } else if (resourceType === "LINK") {
            formData.url = url;
        }

        createMutation.mutate(formData, {
            onSuccess: () => {
                setDialogOpen(false);
                resetForm();
            },
        });
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("NOTES");
        setResourceType("UPLOAD");
        setFile(null);
        setUrl("");
        setSubject("");
        setTopic("");
        setCourse("");
    };

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("resources.title")} — LernChih`}
                description={t("resources.description")}
                canonicalPath="/resources"
                prevPath={prevPath}
                nextPath={nextPath}
                robots={hasQueryParams ? "noindex, follow" : "index, follow"}
                hreflang
            />
            <header className={styles.pageHeader}>
                <h1 className={styles.title}>{t("resources.title")}</h1>
                <div className={styles.headerActions}>
                    {authenticated ? (
                        <Dialog
                            open={dialogOpen}
                            onOpenChange={(_: unknown, d: { open: boolean }) => setDialogOpen(d.open)}
                        >
                            <DialogTrigger disableButtonEnhancement>
                                <Button variant="primary" icon={<Add24Regular />}>
                                    {t("resources.uploadResource")}
                                </Button>
                            </DialogTrigger>
                            <DialogSurface>
                                <DialogBody>
                                    <DialogTitle>{t("resources.uploadResource")}</DialogTitle>
                                    <DialogContent>
                                        {createMutation.isError && (
                                            <MessageBar intent="error">
                                                <MessageBarBody>
                                                    {(createMutation.error as any)?.response?.data
                                                        ?.message || t("resources.loadError")}
                                                </MessageBarBody>
                                            </MessageBar>
                                        )}
                                        <div className={styles.form}>
                                            <Field label={t("resources.titleLabel")} required>
                                                <Input
                                                    value={title}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                    ) => setTitle(e.target.value)}
                                                    placeholder={t("resources.titleLabel")}
                                                />
                                            </Field>
                                            <Field label={t("resources.descriptionLabel")}>
                                                <Textarea
                                                    value={description}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                                    ) => setDescription(e.target.value)}
                                                    placeholder={t("resources.descriptionLabel")}
                                                />
                                            </Field>
                                            <Field label={t("resources.category")}>
                                                <Select
                                                    value={category}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLSelectElement>,
                                                    ) => setCategory(e.target.value)}
                                                >
                                                    {CATEGORIES.map((c) => (
                                                        <option key={c} value={c}>
                                                            {c.replace("_", " ")}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Field>
                                            <Field label={t("resources.type")}>
                                                <Select
                                                    value={resourceType}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLSelectElement>,
                                                    ) => setResourceType(e.target.value)}
                                                >
                                                    <option value="UPLOAD">
                                                        {t("resources.file")}
                                                    </option>
                                                    <option value="LINK">{t("resources.url")}</option>
                                                </Select>
                                            </Field>
                                            {resourceType === "UPLOAD" ? (
                                                <Field label={t("resources.file")}>
                                                    <input
                                                        type="file"
                                                        onChange={(
                                                            e: React.ChangeEvent<HTMLInputElement>,
                                                        ) => setFile(e.target.files?.[0] ?? null)}
                                                    />
                                                </Field>
                                            ) : (
                                                <Field label={t("resources.url")}>
                                                    <Input
                                                        value={url}
                                                        onChange={(
                                                            e: React.ChangeEvent<HTMLInputElement>,
                                                        ) => setUrl(e.target.value)}
                                                        placeholder="https://..."
                                                    />
                                                </Field>
                                            )}
                                            <Field label={t("resources.subject")}>
                                                <Select
                                                    value={subject}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLSelectElement>,
                                                    ) => setSubject(e.target.value)}
                                                >
                                                    <option value="">
                                                        {t("common.select") || "Select subject"}
                                                    </option>
                                                    {SUBJECTS.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Field>
                                            <Field label={t("resources.topic")}>
                                                <Input
                                                    value={topic}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                    ) => setTopic(e.target.value)}
                                                    placeholder="e.g. Calculus"
                                                />
                                            </Field>
                                            <Field label={t("resources.course")}>
                                                <Input
                                                    value={course}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>,
                                                    ) => setCourse(e.target.value)}
                                                    placeholder="e.g. MATH101"
                                                />
                                            </Field>
                                        </div>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button
                                            variant="subtle"
                                            onClick={() => setDialogOpen(false)}
                                        >
                                            {t("common.cancel")}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleCreate}
                                            disabled={createMutation.isPending || !title}
                                            /* B-ui-180: preserve accessible
                                               name while the pending Spinner
                                               replaces the visible label. */
                                            aria-label={
                                                createMutation.isPending
                                                    ? t("common.upload")
                                                    : undefined
                                            }
                                        >
                                            {createMutation.isPending ? (
                                                <Spinner size="tiny" aria-hidden="true" />
                                            ) : (
                                                t("common.upload")
                                            )}
                                        </Button>
                                    </DialogActions>
                                </DialogBody>
                            </DialogSurface>
                        </Dialog>
                    ) : (
                        <Link to="/login?redirect=/resources" className={styles.loginLink}>
                            {t("auth.loginToUpload")}
                        </Link>
                    )}
                </div>
            </header>

            {/* Filter bar */}
            <div className={styles.toolbar}>
                <Input
                    placeholder={t("resources.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchQuery(e.target.value)
                    }
                    className={styles.searchFluid}
                    aria-label={t("resources.searchPlaceholder")}
                />
                <Field label={t("resources.category")}>
                    <Select
                        value={categoryFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setCategoryFilter(e.target.value)
                        }
                        aria-label={t("resources.category")}
                    >
                        <option value="">{t("resources.allCategories")}</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c.replace("_", " ")}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label={t("resources.subject")}>
                    <Select
                        value={subjectFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setSubjectFilter(e.target.value)
                        }
                        aria-label={t("resources.subject")}
                    >
                        <option value="">{t("resources.allSubjects")}</option>
                        {SUBJECTS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label={t("common.sortBy")}>
                    <Select
                        value={sortBy}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setSortBy(e.target.value as "newest" | "oldest" | "upvoted")
                        }
                        aria-label={t("common.sortBy")}
                    >
                        <option value="newest">{t("resources.newest")}</option>
                        <option value="oldest">{t("resources.oldest")}</option>
                        <option value="upvoted">{t("resources.mostUpvoted")}</option>
                    </Select>
                </Field>
            </div>

            {/* Resources grid */}
            {isLoading && (
                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner label={t("common.loading")} aria-hidden="true" />
                </div>
            )}
            {isError && (
                <ErrorState
                    icon={<Document24Regular />}
                    title={t("error.resourcesTitle")}
                    description={t("error.resourcesDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("error.tryAgain")}
                />
            )}
            {!isLoading && !isError && resources.length === 0 && (
                <EmptyState
                    icon={<Document24Regular />}
                    title={t("empty.resourcesTitle")}
                    description={t("empty.resourcesDescription")}
                    action={
                        authenticated ? (
                            <Button
                                variant="primary"
                                icon={<Add24Regular />}
                                onClick={() => setDialogOpen(true)}
                            >
                                {t("empty.resourcesAction")}
                            </Button>
                        ) : undefined
                    }
                />
            )}
            {/* TODO(perf): When resource counts exceed ~100 items, introduce list
          virtualization (e.g. react-window / react-virtual) to avoid
          rendering off-screen DOM nodes. Not added now to keep the change
          dependency-free. Keys are already stable (resource.id). */}
            {!isLoading && !isError && resources.length > 0 && (
                <StaggerReveal className={styles.grid}>
                {paginatedResources.map((resource) => (
                    <HoverLift key={resource.id}>
                        <article>
                            <Card
                                className={`${styles.item} ${styles.itemClickable}`}
                                padding="md"
                                onClick={() =>
                                    navigate(`/resources/${resource.slug || resource.id}`)
                                }
                            >
                                <div className={styles.itemHeader}>
                                    <h2 className={styles.itemTitle}>{resource.title}</h2>
                                    <div className={styles.itemActions}>
                                        {authenticated && (
                                            <Tooltip
                                                content={
                                                    isBookmarked(resource.id)
                                                        ? t("common.removeBookmark")
                                                        : t("common.addBookmark")
                                                }
                                                relationship="label"
                                            >
                                                <Button
                                                    variant="subtle"
                                                    size="small"
                                                    icon={
                                                        isBookmarked(resource.id) ? (
                                                            <Bookmark24Filled />
                                                        ) : (
                                                            <Bookmark24Regular />
                                                        )
                                                    }
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleBookmark(resource.id, resource.title);
                                                    }}
                                                    aria-label={
                                                        isBookmarked(resource.id)
                                                            ? t("common.removeBookmark")
                                                            : t("common.addBookmark")
                                                    }
                                                />
                                            </Tooltip>
                                        )}
                                        <Badge variant="neutral" size="small">
                                            {resource.category?.replace("_", " ") ||
                                                t("resources.general")}
                                        </Badge>
                                    </div>
                                </div>
                                <div className={styles.itemMeta}>
                                    <span>
                                        {t("common.byAuthor", {
                                            author: resource.authorName || t("common.unknown"),
                                        })}
                                    </span>
                                    <Badge variant="accent" size="small">
                                        {resource.upvoteCount ?? 0} {t("resources.upvotes")}
                                    </Badge>
                                </div>
                                {resource.subject && (
                                    <Badge variant="neutral" size="small">
                                        {resource.subject}
                                    </Badge>
                                )}
                                {resource.tags && <TagList tags={resource.tags} />}
                            </Card>
                        </article>
                    </HoverLift>
                ))}
            </StaggerReveal>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
