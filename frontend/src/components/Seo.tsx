import { Helmet } from "react-helmet-async";

/**
 * SEO + document title component (B82).
 *
 * Renders `<title>`, meta description, canonical URL, Open Graph, Twitter
 * card, hreflang alternates, and JSON-LD structured data via react-helmet-async.
 *
 * CONVENTION (B82): Every routed page MUST render `<Seo title="..." />` at the
 * top of its tree so the browser tab and document title stay in sync with the
 * current route. Pages that omit <Seo> leave the previous route's title in the
 * tab, which confuses screen-reader users and breaks SEO/history entries.
 * Always provide a human-readable `title` and a `canonicalPath` matching the
 * route; optional props (description, jsonLd, hreflang) enrich as needed.
 */

export interface SeoProps {
    title: string;
    description?: string;
    robots?: string;
    canonicalPath: string;
    prevPath?: string;
    nextPath?: string;
    ogType?: string;
    ogImage?: string;
    jsonLd?: object | object[];
    hreflang?: boolean;
}

const SITE_NAME = "LernChih";
const DEFAULT_OG_IMAGE = "/og-default.png";

function getBaseUrl(): string {
    const envBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL;
    if (envBaseUrl) return envBaseUrl.replace(/\/$/, "");
    if (typeof window !== "undefined") return window.location.origin;
    return "";
}

export default function Seo({
    title,
    description,
    robots = "index, follow",
    canonicalPath,
    prevPath,
    nextPath,
    ogType = "website",
    ogImage,
    jsonLd,
    hreflang = false,
}: SeoProps) {
    const baseUrl = getBaseUrl();
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    const prevUrl = prevPath ? `${baseUrl}${prevPath}` : undefined;
    const nextUrl = nextPath ? `${baseUrl}${nextPath}` : undefined;
    const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
    const resolvedOgImage = ogImage ?? DEFAULT_OG_IMAGE;

    return (
        <Helmet>
            <title>{title}</title>
            {description ? <meta name="description" content={description} /> : null}
            <meta name="robots" content={robots} />
            <link rel="canonical" href={canonicalUrl} />
            {prevUrl ? <link rel="prev" href={prevUrl} /> : null}
            {nextUrl ? <link rel="next" href={nextUrl} /> : null}

            {/* Open Graph */}
            <meta property="og:title" content={title} />
            {description ? <meta property="og:description" content={description} /> : null}
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:image" content={resolvedOgImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            {description ? <meta name="twitter:description" content={description} /> : null}
            <meta name="twitter:image" content={resolvedOgImage} />

            {/* hreflang alternates */}
            {hreflang ? (
                <>
                    <link rel="alternate" hrefLang="en" href={canonicalUrl} />
                    <link rel="alternate" hrefLang="zh" href={canonicalUrl} />
                    <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
                </>
            ) : null}

            {/* JSON-LD structured data */}
            {jsonLdArray.map((data, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(data)}
                </script>
            ))}
        </Helmet>
    );
}
