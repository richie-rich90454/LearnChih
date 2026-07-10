import type { AxiosResponse } from "axios";
import api from "./axios";

export interface NoteTemplate {
    id: number;
    userId: number | null;
    name: string;
    content: string;
    category: string | null;
    createdAt: string;
}

export interface CreateNoteTemplateRequest {
    name: string;
    content: string;
    category?: string | null;
}

/**
 * List available note templates — system templates plus the user's own (F11).
 */
export const getNoteTemplates = (): Promise<AxiosResponse<NoteTemplate[]>> =>
    api.get<NoteTemplate[]>("/note-templates");

/**
 * Create a new user-scoped note template (F11).
 */
export const createNoteTemplate = (
    data: CreateNoteTemplateRequest,
): Promise<AxiosResponse<NoteTemplate>> =>
    api.post<NoteTemplate>("/note-templates", data);

/**
 * Delete a user-owned note template (F11). System templates cannot be deleted.
 */
export const deleteNoteTemplate = (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/note-templates/${id}`);
