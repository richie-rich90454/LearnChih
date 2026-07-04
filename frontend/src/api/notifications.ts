import type { AxiosResponse } from "axios";
import api from "./axios";
import type { AppNotification } from "../store/notificationStore";

export const getNotifications = (): Promise<AxiosResponse<AppNotification[]>> =>
    api.get<AppNotification[]>("/notifications");

export const markNotificationRead = (id: number): Promise<AxiosResponse<void>> =>
    api.put<void>(`/notifications/${id}/read`);

export const markAllNotificationsRead = (): Promise<AxiosResponse<void>> =>
    api.put<void>("/notifications/read-all");
