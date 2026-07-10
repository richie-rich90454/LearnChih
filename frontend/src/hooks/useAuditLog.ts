import { useQuery } from "@tanstack/react-query";
import { getAuditLogs, type AuditLogParams } from "../api/auditLog";

const AUDIT_LOG_KEY = ["audit-log"] as const;

/**
 * Paginated audit log list. `action` and `page` are query keys so
 * changing them refetches. Pages are 0-indexed to match Spring Data.
 */
export function useAuditLog(params: AuditLogParams) {
    return useQuery({
        queryKey: [...AUDIT_LOG_KEY, params],
        queryFn: () => getAuditLogs(params).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}
