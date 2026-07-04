import type { AxiosResponse } from "axios";
import api from "./axios";

export interface NotificationPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
}

export const getNotificationPreferences = (): Promise<AxiosResponse<NotificationPreferences>> =>
    api.get<NotificationPreferences>("/users/me/preferences/notifications");

export const updateNotificationPreferences = (
    data: NotificationPreferences,
): Promise<AxiosResponse<NotificationPreferences>> =>
    api.put<NotificationPreferences>("/users/me/preferences/notifications", data);
