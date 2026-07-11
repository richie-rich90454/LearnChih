import { useQuery } from "@tanstack/react-query";
import { getDraftsInbox, type DraftItem } from "../api/draftsInbox";

/**
 * Lists all draft items for the unified drafts inbox (F64).
 * The query key is namespaced under ["drafts"] so that draft
 * mutations (e.g. useDeleteDraft, which invalidates ["drafts"])
 * refresh the inbox via prefix matching.
 */
export function useDraftsInbox() {
    return useQuery<DraftItem[]>({
        queryKey: ["drafts", "inbox"],
        queryFn: () => getDraftsInbox().then((r) => r.data),
    });
}
