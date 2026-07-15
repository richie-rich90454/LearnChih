import { Skeleton as FluentSkeleton, SkeletonItem } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";

export function SkeletonLine({ width = "100%" }: { width?: string }) {
    return (
        <FluentSkeleton appearance="opaque">
            <SkeletonItem style={{ width }} />
        </FluentSkeleton>
    );
}

export function SkeletonCard() {
    return (
        <FluentSkeleton appearance="opaque" style={{ padding: 16 }}>
            <SkeletonItem style={{ width: "60%", height: 24, marginBottom: 8 }} />
            <SkeletonItem style={{ width: "100%", height: 16, marginBottom: 4 }} />
            <SkeletonItem style={{ width: "100%", height: 16, marginBottom: 4 }} />
            <SkeletonItem style={{ width: "40%", height: 16 }} />
        </FluentSkeleton>
    );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
    /*
     * B-ui-191: expose the skeleton as a status region so assistive tech
     * announces that content is loading. Without role="status" and
     * aria-live="polite", screen readers silently show the skeleton
     * placeholders with no "loading" announcement, violating WCAG 4.1.3
     * (Status Messages). The aria-label uses the common.loading translation
     * key with a sensible default.
     */
    const { t } = useTranslation();
    return (
        <div
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
            role="status"
            aria-live="polite"
            aria-label={t("common.loading", "Loading")}
        >
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
