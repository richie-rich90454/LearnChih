import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    type NotificationPreferences,
} from "../api/preferences";

const STORAGE_KEY = "lernchih-notification-preferences";

function loadLocal(): NotificationPreferences {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore
    }
    return { emailNotifications: true, pushNotifications: false };
}

function saveLocal(data: NotificationPreferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useNotificationPreferences() {
    const queryClient = useQueryClient();
    const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>(loadLocal);

    const query = useQuery<NotificationPreferences>({
        queryKey: ["notificationPreferences"],
        queryFn: () => getNotificationPreferences().then((r) => r.data),
        initialData: localPrefs,
    });

    useEffect(() => {
        if (query.data) {
            setLocalPrefs(query.data);
            saveLocal(query.data);
        }
    }, [query.data]);

    const mutation = useMutation({
        mutationFn: (data: NotificationPreferences) => updateNotificationPreferences(data),
        onSuccess: (response) => {
            const data = response.data;
            setLocalPrefs(data);
            saveLocal(data);
            queryClient.setQueryData(["notificationPreferences"], data);
        },
        onError: () => {
            // Fall back to local-only if endpoint is unavailable.
        },
    });

    const setPreferences = (data: NotificationPreferences) => {
        setLocalPrefs(data);
        saveLocal(data);
        mutation.mutate(data);
    };

    return {
        preferences: query.data ?? localPrefs,
        isLoading: query.isLoading,
        setPreferences,
    };
}
