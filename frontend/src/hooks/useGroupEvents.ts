import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createGroupEvent,
    deleteGroupEvent,
    getEventRsvps,
    getGroupEvents,
    rsvpEvent,
    type CreateEventRequest,
    type UpdateRsvpRequest,
} from "../api/groupEvents";

const invalidateGroup = (
    qc: ReturnType<typeof useQueryClient>,
    groupId: number,
) => {
    qc.invalidateQueries({ queryKey: ["groupEvents", groupId] });
};

export function useGroupEvents(groupId: number | null) {
    return useQuery({
        queryKey: ["groupEvents", groupId],
        queryFn: () => getGroupEvents(groupId!).then((r) => r.data),
        enabled: groupId != null,
    });
}

export function useEventRsvps(
    groupId: number | null,
    eventId: number | null,
) {
    return useQuery({
        queryKey: ["eventRsvps", groupId, eventId],
        queryFn: () => getEventRsvps(groupId!, eventId!).then((r) => r.data),
        enabled: groupId != null && eventId != null,
    });
}

export function useCreateGroupEvent(groupId: number | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateEventRequest) =>
            createGroupEvent(groupId!, data),
        onSuccess: () => invalidateGroup(qc, groupId!),
    });
}

export function useRsvpEvent(groupId: number | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            eventId,
            data,
        }: {
            eventId: number;
            data: UpdateRsvpRequest;
        }) => rsvpEvent(groupId!, eventId, data),
        onSuccess: () => invalidateGroup(qc, groupId!),
    });
}

export function useDeleteGroupEvent(groupId: number | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (eventId: number) => deleteGroupEvent(groupId!, eventId),
        onSuccess: () => invalidateGroup(qc, groupId!),
    });
}
