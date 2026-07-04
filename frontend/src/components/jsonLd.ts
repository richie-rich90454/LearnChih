// JSON-LD schema builders for structured data (SEO).
// See https://schema.org for type definitions.

const SITE_NAME = "LernChih";

function origin(): string {
    if (typeof window !== "undefined") return window.location.origin;
    return "";
}

/** Organization schema for LernChih. */
export function organizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: origin(),
    };
}

/** WebSite schema with SearchAction (sitelinks search box). */
export function websiteSchema(baseUrl: string) {
    const base = baseUrl.replace(/\/$/, "");
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: base,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${base}/resources?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };
}

export interface ArticleSchemaInput {
    title: string;
    description?: string;
    url: string;
    image?: string;
    datePublished?: string;
    author?: string;
}

/** Article schema for a learning resource detail page. */
export function articleSchema({
    title,
    description,
    url,
    image,
    datePublished,
    author,
}: ArticleSchemaInput) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: description || title,
        url,
        ...(image ? { image } : {}),
        ...(datePublished ? { datePublished } : {}),
        ...(author ? { author: { "@type": "Person", name: author } } : {}),
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
        },
    };
}

export interface DiscussionForumPostingSchemaInput {
    title: string;
    description?: string;
    url: string;
    author?: string;
    datePublished?: string;
}

/** DiscussionForumPosting schema for a channel thread page. */
export function discussionForumPostingSchema({
    title,
    description,
    url,
    author,
    datePublished,
}: DiscussionForumPostingSchemaInput) {
    return {
        "@context": "https://schema.org",
        "@type": "DiscussionForumPosting",
        headline: title,
        description: description || title,
        url,
        ...(author ? { author: { "@type": "Person", name: author } } : {}),
        ...(datePublished ? { datePublished } : {}),
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
        },
    };
}

export interface BreadcrumbItem {
    name: string;
    url: string;
}

/** BreadcrumbList schema from a list of {name, url} items. */
export function breadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}
