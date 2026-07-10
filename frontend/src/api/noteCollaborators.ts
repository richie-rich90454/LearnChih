import type { AxiosResponse } from "axios";
import api from "./axios";

export interface NoteCollaborator {
    id: number;
    noteId: number;
    userId: number;
    userName: string;
    role: string;
    addedAt: string;
}

export interface AddCollaboratorRequest {
    userId: number;
    role?: string;
}

/**
 * List collaborators for a note (F14). The note owner and any registered
 * collaborator may call this.
 */
export const getNoteCollaborators = (
    noteId: number,
): Promise<AxiosResponse<NoteCollaborator[]>> =>
    api.get<NoteCollaborator[]>(`/notes/${noteId}/collaborators`);

/**
 * Add a collaborator to a note (F14). Only the note owner may add collaborators.
 */
export const addNoteCollaborator = (
    noteId: number,
    data: AddCollaboratorRequest,
): Promise<AxiosResponse<NoteCollaborator>> =>
    api.post<NoteCollaborator>(`/notes/${noteId}/collaborators`, data);

/**
 * Remove a collaborator from a note (F14). Only the note owner may remove
 * collaborators; the OWNER role cannot be removed.
 */
export const removeNoteCollaborator = (
    noteId: number,
    collaboratorId: number,
): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/notes/${noteId}/collaborators/${collaboratorId}`);
