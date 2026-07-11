import api from "./axios";

/**
 * Export a note to Markdown format (F26). Triggers a browser download.
 */
export const exportNoteMarkdown = async (noteId: number, title: string): Promise<void> => {
    const response = await api.get(`/notes/${noteId}/export-markdown`, {
        responseType: "blob",
    });
    downloadBlob(response.data, safeFilename(title), ".md");
};

/**
 * Export a note to PDF format (F26). Triggers a browser download.
 */
export const exportNotePdf = async (noteId: number, title: string): Promise<void> => {
    const response = await api.get(`/notes/${noteId}/export-pdf`, {
        responseType: "blob",
    });
    downloadBlob(response.data, safeFilename(title), ".pdf");
};

function downloadBlob(data: Blob, filename: string, extension: string): void {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function safeFilename(name: string): string {
    if (!name) return "note";
    return name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "_") || "note";
}
