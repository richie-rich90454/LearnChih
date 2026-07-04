import { Skeleton as FluentSkeleton, SkeletonItem } from "@fluentui/react-components";

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
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
