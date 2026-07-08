import { useEffect, type RefObject } from "react";
import {
    Toast,
    ToastTitle,
    useToastController,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import styles from "./HeadingAnchor.module.css";

/**
 * Slugify heading text into a URL-safe anchor id: lowercase, strip non-word
 * characters, collapse whitespace to hyphens, and trim hyphen edges.
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Fluent-style filled link glyph (matches Link24Regular) rendered inline so
// the injected <a> stays framework-agnostic for dangerouslySetInnerHTML output.
const LINK_ICON_SVG =
    '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M10 6H8a4 4 0 0 0 0 8h2a.75.75 0 0 0 0-1.5H8a2.5 2.5 0 0 1 0-5h2a.75.75 0 0 0 0-1.5Zm-2 4.75h8a.75.75 0 0 0 0-1.5H8a.75.75 0 0 0 0 1.5ZM14 18h2a4 4 0 0 0 0-8h-2a.75.75 0 0 0 0 1.5h2a2.5 2.5 0 0 1 0 5h-2a.75.75 0 0 0 0 1.5Z"/></svg>';

/**
 * Copy-link-to-section affordance (F82). Post-processes h2/h3 headings inside
 * the referenced container: assigns a slugified `id`, pins a link glyph to the
 * heading's inline-start edge (revealed on hover / keyboard focus-within), and
 * copies `origin + pathname + #slug` to the clipboard on click, dispatching a
 * "Link copied" toast. A MutationObserver re-runs on async content (markdown
 * posts, related-resource sections) so headings injected later still get
 * anchors. Already-processed headings are skipped via a data attribute, and
 * existing ids are reserved up front so duplicate heading text never collides.
 *
 * Spec ref: F82.
 */
export function useHeadingAnchors<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
): void {
    const { t } = useTranslation();
    const { dispatchToast } = useToastController("main-toaster");

    useEffect(() => {
        const root = ref.current;
        if (!root) return;

        const process = () => {
            const headings = root.querySelectorAll<HTMLElement>("h2, h3");
            // Reserve every existing id up front so async siblings with the
            // same heading text cannot collide.
            const taken = new Set<string>();
            headings.forEach((h) => {
                if (h.id) taken.add(h.id);
            });
            headings.forEach((h) => {
                const text = (h.textContent || "").trim();
                if (!text) return;
                // Skip headings we already augmented (foreign <a> child).
                if (h.querySelector("a[data-anchor-link]")) return;

                let slug = h.id || slugify(text) || "section";
                let n = 2;
                while (taken.has(slug)) {
                    slug = `${h.id || slugify(text) || "section"}-${n}`;
                    n++;
                }
                taken.add(slug);
                if (!h.id) h.id = slug;

                h.classList.add(styles.heading);

                const link = document.createElement("a");
                link.setAttribute("data-anchor-link", "");
                link.href = `#${slug}`;
                link.className = styles.anchor;
                link.setAttribute(
                    "aria-label",
                    t("anchorLinks.copyLabel", { section: text }),
                );
                link.innerHTML = LINK_ICON_SVG;
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    const url = `${window.location.origin}${window.location.pathname}#${slug}`;
                    const notify = () =>
                        dispatchToast(
                            <Toast>
                                <ToastTitle>{t("anchorLinks.linkCopied")}</ToastTitle>
                            </Toast>,
                            { intent: "success" },
                        );
                    if (navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(url).then(notify).catch(() => {});
                    } else {
                        notify();
                    }
                });
                h.appendChild(link);
            });
        };

        process();
        const observer = new MutationObserver(process);
        observer.observe(root, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [ref, t, dispatchToast]);
}

export default useHeadingAnchors;
