import { useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * Active-nav resolver for nested routes (B83).
 *
 * Determines which top-level nav item should be marked active given the current
 * path. The naive `pathname.startsWith(path)` approach marks every ancestor
 * active (e.g. both `/admin` and `/admin/users`), which is correct for a sidebar
 * tree but wrong for a flat primary nav where only one item should be
 * highlighted. This hook picks the longest matching prefix so the most specific
 * nav item wins.
 *
 * CONVENTION (B83): Pass the array of registered nav paths to
 * `useActiveNav(navPaths)` and use the returned `activePath` to apply the
 * `aria-current="page"` + active styling to exactly one nav button.
 *
 * Usage:
 *   const navPaths = ["/dashboard", "/resources", "/admin"];
 *   const activePath = useActiveNav(navPaths);
 *   // activePath === "/admin" when at /admin/users
 */

/**
 * Returns the nav path from `paths` that is the longest prefix of `pathname`.
 * A path matches only at a segment boundary (e.g. "/admin" matches
 * "/admin/users" but "/ad" does not). The root "/" only matches exactly.
 */
export function resolveActiveNav(
    pathname: string,
    paths: readonly string[],
): string | undefined {
    let best: string | undefined;
    let bestLen = -1;
    for (const p of paths) {
        if (p === "/") {
            if (pathname === "/" && p.length > bestLen) {
                best = p;
                bestLen = p.length;
            }
            continue;
        }
        // Segment-boundary match: pathname === p or pathname starts with p + "/".
        if (pathname === p || pathname.startsWith(p + "/")) {
            if (p.length > bestLen) {
                best = p;
                bestLen = p.length;
            }
        }
    }
    return best;
}

export function useActiveNav(
    navPaths: readonly string[],
): string | undefined {
    const location = useLocation();
    return useMemo(
        () => resolveActiveNav(location.pathname, navPaths),
        [location.pathname, navPaths],
    );
}

export default useActiveNav;
