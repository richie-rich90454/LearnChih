import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import Seo, { type SeoProps } from "../Seo";

function SeoPreview(props: SeoProps) {
    const [headHtml, setHeadHtml] = useState("");

    useEffect(() => {
        const update = () => {
            const relevant = Array.from(document.head.children)
                .filter(
                    (el) =>
                        el.tagName === "TITLE" ||
                        (el.tagName === "META" &&
                            [
                                "description",
                                "robots",
                                "og:title",
                                "og:description",
                                "og:type",
                                "twitter:title",
                            ].some(
                                (name) =>
                                    el.getAttribute("name") === name ||
                                    el.getAttribute("property") === name,
                            )) ||
                        el.tagName === "LINK" ||
                        el.tagName === "SCRIPT",
                )
                .map((el) => el.outerHTML)
                .join("\n");
            setHeadHtml(relevant);
        };
        update();
        const id = setTimeout(update, 50);
        return () => clearTimeout(id);
    }, [props]);

    return (
        <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
            <Seo {...props} />
            <h2>Rendered &lt;head&gt; tags</h2>
            <pre
                style={{
                    background: "var(--colorNeutralBackground2)",
                    padding: 16,
                    borderRadius: 8,
                    overflow: "auto",
                }}
            >
                {headHtml || "<!-- head tags rendered by Helmet -->"}
            </pre>
        </div>
    );
}

const meta: Meta<typeof SeoPreview> = {
    title: "Shared/Seo",
    component: SeoPreview,
    argTypes: {
        canonicalPath: { control: "text" },
        description: { control: "text" },
        hreflang: { control: "boolean" },
        ogImage: { control: "text" },
        ogType: { control: "text" },
        robots: { control: "text" },
        title: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof SeoPreview>;

export const Default: Story = {
    args: {
        title: "LernChih – Learn Together",
        description: "A collaborative learning platform.",
        canonicalPath: "/",
    },
};

export const NoDescription: Story = {
    args: {
        title: "LernChih – No Description",
        canonicalPath: "/no-description",
        robots: "index, follow",
    },
};

export const NoIndex: Story = {
    args: {
        title: "LernChih – Private Page",
        description: "This page should not be indexed.",
        canonicalPath: "/private",
        robots: "noindex, nofollow",
    },
};

export const WithOpenGraph: Story = {
    args: {
        title: "LernChih – Featured Resource",
        description: "Check out this learning resource.",
        canonicalPath: "/resources/1",
        ogType: "article",
        ogImage: "https://example.com/og.png",
    },
};

export const WithHreflang: Story = {
    args: {
        title: "LernChih – Localized",
        description: "Page with hreflang alternates.",
        canonicalPath: "/localized",
        hreflang: true,
    },
};

export const WithJsonLd: Story = {
    args: {
        title: "LernChih – Structured Data",
        description: "Page with JSON-LD structured data.",
        canonicalPath: "/structured",
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "LernChih",
            url: "https://lernchih.example.com",
        },
    },
};
