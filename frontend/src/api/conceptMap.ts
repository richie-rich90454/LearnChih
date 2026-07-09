import type { AxiosResponse } from "axios";
import api from "./axios";

export interface ConceptMapNode {
    id: number;
    label: string;
    posX: number;
    posY: number;
}

export interface ConceptMapEdge {
    id: number;
    sourceId: number;
    targetId: number;
}

export interface ConceptMapData {
    nodes: ConceptMapNode[];
    edges: ConceptMapEdge[];
}

export interface CreateNodeRequest {
    label: string;
    posX?: number;
    posY?: number;
    parentId?: number | null;
}

export interface NodePosition {
    id: number;
    posX: number;
    posY: number;
}

export interface SaveLayoutRequest {
    nodes: NodePosition[];
}

export interface SubjectOption {
    id: number;
    name: string;
}

/**
 * Fetch the full concept map (nodes + edges) for a subject (F6).
 */
export const getConceptMap = (
    subjectId: number,
): Promise<AxiosResponse<ConceptMapData>> =>
    api.get<ConceptMapData>(`/subjects/${subjectId}/concept-map`);

/**
 * Add a node to a subject's concept map (F6). An optional parentId creates a
 * directed edge from the parent to the new node.
 */
export const addConceptMapNode = (
    subjectId: number,
    request: CreateNodeRequest,
): Promise<AxiosResponse<ConceptMapNode>> =>
    api.post<ConceptMapNode>(`/subjects/${subjectId}/concept-map/nodes`, request);

/**
 * Persist a rearranged node layout in bulk (F6).
 */
export const saveConceptMapLayout = (
    subjectId: number,
    request: SaveLayoutRequest,
): Promise<AxiosResponse<void>> =>
    api.put<void>(`/subjects/${subjectId}/concept-map/layout`, request);

/**
 * Delete a node from a subject's concept map (F6). Edges cascade-delete.
 */
export const deleteConceptMapNode = (
    subjectId: number,
    nodeId: number,
): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/subjects/${subjectId}/concept-map/nodes/${nodeId}`);

/**
 * List all subjects (id + name) for the concept-map dropdown (F6).
 */
export const getSubjects = (): Promise<AxiosResponse<SubjectOption[]>> =>
    api.get<SubjectOption[]>("/subjects");
