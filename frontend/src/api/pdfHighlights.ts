import type { AxiosResponse } from "axios";
import api from "./axios";

export interface PdfHighlight {
    id: number;
    userId: number;
    resourceId: number;
    pageNumber: number;
    highlightedText: string;
    color: string | null;
    note: string | null;
    createdAt: string;
}

export interface CreatePdfHighlightRequest {
    resourceId: number;
    pageNumber: number;
    highlightedText: string;
    color?: string | null;
    note?: string | null;
}

export interface UpdatePdfHighlightRequest {
    color?: string | null;
    note?: string | null;
}

/**
 * List the current user's highlights for a given resource (F12).
 */
export const getPdfHighlights = (
    resourceId: number,
): Promise<AxiosResponse<PdfHighlight[]>> =>
    api.get<PdfHighlight[]>("/pdf-highlights", { params: { resourceId } });

/**
 * Create a new PDF highlight (F12).
 */
export const createPdfHighlight = (
    data: CreatePdfHighlightRequest,
): Promise<AxiosResponse<PdfHighlight>> =>
    api.post<PdfHighlight>("/pdf-highlights", data);

/**
 * Update a highlight's color or note (F12).
 */
export const updatePdfHighlight = (
    id: number,
    data: UpdatePdfHighlightRequest,
): Promise<AxiosResponse<PdfHighlight>> =>
    api.put<PdfHighlight>(`/pdf-highlights/${id}`, data);

/**
 * Delete a highlight (F12).
 */
export const deletePdfHighlight = (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/pdf-highlights/${id}`);
