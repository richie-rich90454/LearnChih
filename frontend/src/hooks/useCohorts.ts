import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCohorts,
    getCohort,
    createCohort,
    joinCohort,
    leaveCohort,
    getCohortMembers,
    type Cohort,
    type CohortMember,
    type CreateCohortRequest,
} from "@/api/cohorts";

export function useCohorts() {
    return useQuery<Cohort[]>({
        queryKey: ["cohorts"],
        queryFn: () => getCohorts().then((r) => r.data),
    });
}

export function useCohort(id: number | null) {
    return useQuery<Cohort>({
        queryKey: ["cohorts", id],
        queryFn: () => getCohort(id as number).then((r) => r.data),
        enabled: id != null,
    });
}

export function useCohortMembers(id: number | null) {
    return useQuery<CohortMember[]>({
        queryKey: ["cohorts", id, "members"],
        queryFn: () => getCohortMembers(id as number).then((r) => r.data),
        enabled: id != null,
    });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: ["cohorts"] });
}

export function useCreateCohort() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCohortRequest) =>
            createCohort(data).then((r) => r.data),
        onSuccess: () => invalidateAll(queryClient),
    });
}

export function useJoinCohort() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => joinCohort(id).then((r) => r.data),
        onSuccess: () => invalidateAll(queryClient),
    });
}

export function useLeaveCohort() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => leaveCohort(id).then(() => undefined),
        onSuccess: () => invalidateAll(queryClient),
    });
}
