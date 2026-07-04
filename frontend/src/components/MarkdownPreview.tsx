interface MarkdownPreviewProps {
    content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
    // Lightweight markdown: headers, bold, italic, links, lists
    const html = content
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>")
        .replace(/\*(.*)\*/gim, "<i>$1</i>")
        .replace(
            /\[([^\]]+)\]\(([^)]+)\)/gim,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
        )
        .replace(/\n/gim, "<br />");
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default MarkdownPreview;
