import { Helmet } from "react-helmet-async";

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
            {ogImage ? <meta property="og:image" content={ogImage} /> : null}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            {description ? <meta name="twitter:description" content={description} /> : null}
            {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

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
