import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getPortfolio,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    type CreatePortfolioItemRequest,
    type UpdatePortfolioItemRequest,
} from "../api/portfolio";

/**
 * React Query hooks for user profile portfolios (F35).
 */

const portfolioKey = (userId: number) => ["portfolio", userId] as const;

export function usePortfolio(userId: number | null | undefined) {
    return useQuery({
        queryKey: portfolioKey(userId as number),
        queryFn: () => getPortfolio(userId as number).then((r) => r.data),
        enabled: userId != null,
    });
}

export function useCreatePortfolioItem(userId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePortfolioItemRequest) => createPortfolioItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: portfolioKey(userId) });
        },
    });
}

export function useUpdatePortfolioItem(userId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePortfolioItemRequest }) =>
            updatePortfolioItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: portfolioKey(userId) });
        },
    });
}

export function useDeletePortfolioItem(userId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deletePortfolioItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: portfolioKey(userId) });
        },
    });
}
