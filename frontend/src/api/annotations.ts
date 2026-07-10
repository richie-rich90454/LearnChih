import type { AxiosResponse } from "axios";
import api from "./axios";

export interface Annotation {
    id: number;
    userId: number;
    resourceId: number;
    quote: string;
    content: string;
    startOffset: number | null;
    endOffset: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAnnotationRequest {
    resourceId: number;
    quote: string;
    content: string;
    startOffset?: number | null;
    endOffset?: number | null;
}

export interface UpdateAnnotationRequest {
    content: string;
}

/**
 * List the current user's annotations for a given resource (F13).
 */
export const getAnnotations = (
    resourceId: number,
): Promise<AxiosResponse<Annotation[]>> =>
    api.get<Annotation[]>("/annotations", { params: { resourceId } });

/**
 * Create a new inline annotation (F13).
 */
export const createAnnotation = (
    data: CreateAnnotationRequest,
): Promise<AxiosResponse<Annotation>> =>
    api.post<Annotation>("/annotations", data);

/**
 * Update an annotation's content (F13).
 */
export const updateAnnotation = (
    id: number,
    data: UpdateAnnotationRequest,
): Promise<AxiosResponse<Annotation>> =>
    api.put<Annotation>(`/annotations/${id}`, data);

/**
 * Delete an annotation (F13).
 */
export const deleteAnnotation = (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/annotations/${id}`);
