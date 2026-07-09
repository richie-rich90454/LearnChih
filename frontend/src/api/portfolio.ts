import type { AxiosResponse } from "axios";
import api from "./axios";

export interface PortfolioItem {
    id: number;
    userId: number;
    title: string;
    description: string | null;
    url: string | null;
    displayOrder: number;
    createdAt: string;
}

export interface CreatePortfolioItemRequest {
    title: string;
    description?: string;
    url?: string;
    displayOrder?: number;
}

export interface UpdatePortfolioItemRequest {
    title?: string;
    description?: string;
    url?: string;
    displayOrder?: number;
}

/**
 * User profile portfolios API (F35). Public reads go through
 * /api/users/{userId}/portfolio; owner management through /api/portfolio.
 */
export const getPortfolio = (
    userId: number,
): Promise<AxiosResponse<PortfolioItem[]>> =>
    api.get<PortfolioItem[]>(`/users/${userId}/portfolio`);

export const createPortfolioItem = (
    data: CreatePortfolioItemRequest,
): Promise<AxiosResponse<PortfolioItem>> =>
    api.post<PortfolioItem>("/portfolio", data);

export const updatePortfolioItem = (
    id: number,
    data: UpdatePortfolioItemRequest,
): Promise<AxiosResponse<PortfolioItem>> =>
    api.put<PortfolioItem>(`/portfolio/${id}`, data);

export const deletePortfolioItem = (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/portfolio/${id}`);
