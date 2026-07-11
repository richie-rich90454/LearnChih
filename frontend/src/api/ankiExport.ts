import api from "./axios";

/**
 * Export a flashcard deck to Anki .apkg format (F25). Triggers a browser
 * download of the generated file.
 */
export const exportDeckToAnki = async (deckId: number, deckName: string): Promise<void> => {
    const response = await api.get(`/flashcard-decks/${deckId}/export-anki`, {
        responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    const safeName = (deckName || "flashcards").replace(/[^a-zA-Z0-9-_]/g, "_");
    link.setAttribute("download", `${safeName}.apkg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
