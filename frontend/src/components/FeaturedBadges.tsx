import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Spinner,
    Badge as FluentBadge,
    Tooltip,
} from "@fluentui/react-components";
import { Edit24Regular, Trophy24Regular } from "@fluentui/react-icons";
import {
    useFeaturedBadges,
    useEarnedBadges,
    useSetFeaturedBadges,
} from "@/hooks/useFeaturedBadges";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import styles from "./FeaturedBadges.module.css";

interface FeaturedBadgesProps {
    userId: number;
    /** Whether the viewer is the profile owner and may edit the showcase. */
    editable: boolean;
}

const MAX_FEATURED = 3;

/**
 * Featured-badge showcase (F37). Displays up to 3 badges the user has chosen
 * to highlight on their profile. The owner can pick from earned badges via
 * an edit dialog; other viewers see a read-only showcase.
 */
export function FeaturedBadges({ userId, editable }: FeaturedBadgesProps) {
    const { t } = useTranslation();
    const featuredQuery = useFeaturedBadges(userId);
    const setFeatured = useSetFeaturedBadges();

    const [dialogOpen, setDialogOpen] = useState(false);
    const earnedQuery = useEarnedBadges(editable && dialogOpen);

    const [selected, setSelected] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (earnedQuery.data) {
            setSelected(
                new Set(
                    earnedQuery.data
                        .filter((b) => b.featured)
                        .map((b) => b.badgeId),
                ),
            );
        }
    }, [earnedQuery.data]);

    const featured = featuredQuery.data ?? [];

    if (!editable && featured.length === 0) {
        return null;
    }

    const toggleBadge = (badgeId: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(badgeId)) {
                next.delete(badgeId);
            } else if (next.size < MAX_FEATURED) {
                next.add(badgeId);
            }
            return next;
        });
    };

    const handleSubmit = () => {
        setFeatured.mutate(Array.from(selected), {
            onSuccess: () => setDialogOpen(false),
        });
    };

    return (
        <Card padding="lg" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t("featuredBadges.title")}</h2>
                {editable && (
                    <Button
                        variant="subtle"
                        icon={<Edit24Regular />}
                        onClick={() => setDialogOpen(true)}
                    >
                        {t("featuredBadges.edit")}
                    </Button>
                )}
            </div>

            {featured.length > 0 ? (
                <div className={styles.showcase}>
                    {featured.map((badge) => (
                        <Tooltip
                            key={badge.userBadgeId}
                            content={badge.description || badge.name}
                            relationship="label"
                        >
                            <div className={styles.badgeCard}>
                                <div className={styles.icon}>
                                    {badge.icon || <Trophy24Regular />}
                                </div>
                                <FluentBadge
                                    appearance="filled"
                                    color="brand"
                                    size="small"
                                >
                                    {badge.name}
                                </FluentBadge>
                            </div>
                        </Tooltip>
                    ))}
                </div>
            ) : (
                <p className={styles.empty}>{t("featuredBadges.empty")}</p>
            )}

            <Dialog
                open={dialogOpen}
                onOpenChange={(_, d) => setDialogOpen(d.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>
                            {t("featuredBadges.editTitle")}
                        </DialogTitle>
                        <DialogContent>
                            <p className={styles.hint}>
                                {t("featuredBadges.hint", {
                                    max: MAX_FEATURED,
                                })}
                            </p>
                            {earnedQuery.isLoading ? (
                                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                                    <Spinner size="tiny" />
                                </div>
                            ) : earnedQuery.data &&
                              earnedQuery.data.length > 0 ? (
                                <div className={styles.pickerGrid}>
                                    {earnedQuery.data.map((badge) => {
                                        const isSelected = selected.has(
                                            badge.badgeId,
                                        );
                                        const disabled =
                                            !isSelected &&
                                            selected.size >= MAX_FEATURED;
                                        return (
                                            <button
                                                key={badge.userBadgeId}
                                                type="button"
                                                className={`${styles.pickerCard} ${isSelected ? styles.pickerSelected : ""} ${disabled ? styles.pickerDisabled : ""}`}
                                                onClick={() =>
                                                    toggleBadge(badge.badgeId)
                                                }
                                                disabled={disabled}
                                            >
                                                <div className={styles.icon}>
                                                    {badge.icon || (
                                                        <Trophy24Regular />
                                                    )}
                                                </div>
                                                <span
                                                    className={styles.pickerName}
                                                >
                                                    {badge.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className={styles.empty}>
                                    {t("featuredBadges.noEarned")}
                                </p>
                            )}
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
                                onClick={handleSubmit}
                                disabled={setFeatured.isPending}
                            >
                                {setFeatured.isPending ? (
                                    <Spinner size="tiny" />
                                ) : (
                                    t("common.save")
                                )}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </Card>
    );
}

export default FeaturedBadges;
