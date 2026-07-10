import type { AxiosResponse } from "axios";
import api from "./axios";

export interface Note {
    id: number;
    userId: number;
    title: string;
    content: string;
    subjectId: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateNoteRequest {
    title: string;
    content: string;
    subjectId?: number | null;
}

export interface UpdateNoteRequest {
    title?: string;
    content?: string;
    subjectId?: number | null;
}

/**
 * List the current user's notes, optionally filtered by title (F9).
 */
export const getNotes = (q?: string): Promise<AxiosResponse<Note[]>> =>
    api.get<Note[]>("/notes", { params: q ? { q } : undefined });

/**
 * Create a new note (F9).
 */
export const createNote = (
    data: CreateNoteRequest,
): Promise<AxiosResponse<Note>> => api.post<Note>("/notes", data);

/**
 * Update an existing note (F9).
 */
export const updateNote = (
    id: number,
    data: UpdateNoteRequest,
): Promise<AxiosResponse<Note>> => api.put<Note>(`/notes/${id}`, data);

/**
 * Delete a note (F9).
 */
export const deleteNote = (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/notes/${id}`);
