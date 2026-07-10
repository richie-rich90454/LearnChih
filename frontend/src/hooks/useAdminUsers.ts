import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    bulkUserAction,
    getAdminUsers,
    updateUserRole,
    updateUserStatus,
    type AdminUsersParams,
    type UserRole,
    type UserStatus,
} from "../api/adminUsers";

const ADMIN_USERS_KEY = ["admin-users"] as const;

/**
 * Paginated, searchable admin user list. `search` and `page` are query keys
 * so changing them refetches. Pages are 0-indexed to match Spring Data.
 */
export function useAdminUsers(params: AdminUsersParams) {
    return useQuery({
        queryKey: [...ADMIN_USERS_KEY, params],
        queryFn: () => getAdminUsers(params).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}

function useInvalidateUsers() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
}

export function useUpdateUserRole() {
    const invalidate = useInvalidateUsers();
    return useMutation({
        mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
            updateUserRole(id, role).then((r) => r.data),
        onSuccess: invalidate,
    });
}

export function useUpdateUserStatus() {
    const invalidate = useInvalidateUsers();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: UserStatus }) =>
            updateUserStatus(id, status).then((r) => r.data),
        onSuccess: invalidate,
    });
}

export function useBulkUserAction() {
    const invalidate = useInvalidateUsers();
    return useMutation({
        mutationFn: ({
            action,
            userIds,
        }: {
            action: "SUSPEND" | "ACTIVATE" | "DELETE";
            userIds: number[];
        }) => bulkUserAction(action, userIds).then((r) => r.data),
        onSuccess: invalidate,
    });
}
