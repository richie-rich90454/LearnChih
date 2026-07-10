import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createWhiteboard,
    deleteWhiteboard,
    getWhiteboard,
    getWhiteboards,
    updateWhiteboard,
    type CreateWhiteboardRequest,
    type UpdateWhiteboardRequest,
} from "../api/whiteboards";

const invalidateGroup = (
    qc: ReturnType<typeof useQueryClient>,
    groupId: number,
) => {
    qc.invalidateQueries({ queryKey: ["whiteboards", groupId] });
};

export function useWhiteboards(groupId: number | null) {
    return useQuery({
        queryKey: ["whiteboards", groupId],
        queryFn: () => getWhiteboards(groupId!).then((r) => r.data),
        enabled: groupId != null,
    });
}

export function useWhiteboard(
    groupId: number | null,
    id: number | null,
) {
    return useQuery({
        queryKey: ["whiteboard", groupId, id],
        queryFn: () => getWhiteboard(groupId!, id!).then((r) => r.data),
        enabled: groupId != null && id != null,
    });
}

export function useCreateWhiteboard(groupId: number | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateWhiteboardRequest) =>
            createWhiteboard(groupId!, data),
        onSuccess: () => invalidateGroup(qc, groupId!),
    });
}

export function useUpdateWhiteboard(groupId: number | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: UpdateWhiteboardRequest;
        }) => updateWhiteboard(groupId!, id, data),
        onSuccess: () => invalidateGroup(qc, groupId!),
    });
}

export function useDeleteWhiteboard(groupId: number | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteWhiteboard(groupId!, id),
        onSuccess: () => invalidateGroup(qc, groupId!),
    });
}
