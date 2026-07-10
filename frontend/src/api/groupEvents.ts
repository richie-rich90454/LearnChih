import type { AxiosResponse } from "axios";
import api from "./axios";

export interface GroupEvent {
    id: number;
    groupId: number;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string | null;
    location: string | null;
    meetingUrl: string | null;
    createdBy: number;
    creatorName: string;
    goingCount: number;
    maybeCount: number;
    notGoingCount: number;
    /** GOING, MAYBE, NOT_GOING, or null when the viewer has not responded. */
    viewerStatus: string | null;
    createdAt: string;
}

export interface EventRsvp {
    id: number;
    eventId: number;
    userId: number;
    userName: string;
    status: string;
    respondedAt: string;
}

export interface CreateEventRequest {
    title: string;
    description?: string;
    startTime: string;
    endTime?: string | null;
    location?: string | null;
    meetingUrl?: string | null;
}

export interface UpdateRsvpRequest {
    status: string;
}

/**
 * Group events / meetups API (F41).
 * Endpoints mirror GroupEventController on the backend.
 */
export const getGroupEvents = (
    groupId: number,
): Promise<AxiosResponse<GroupEvent[]>> =>
    api.get<GroupEvent[]>(`/groups/${groupId}/events`);

export const createGroupEvent = (
    groupId: number,
    data: CreateEventRequest,
): Promise<AxiosResponse<GroupEvent>> =>
    api.post<GroupEvent>(`/groups/${groupId}/events`, data);

export const rsvpEvent = (
    groupId: number,
    eventId: number,
    data: UpdateRsvpRequest,
): Promise<AxiosResponse<GroupEvent>> =>
    api.post<GroupEvent>(`/groups/${groupId}/events/${eventId}/rsvp`, data);

export const getEventRsvps = (
    groupId: number,
    eventId: number,
): Promise<AxiosResponse<EventRsvp[]>> =>
    api.get<EventRsvp[]>(`/groups/${groupId}/events/${eventId}/rsvps`);

export const deleteGroupEvent = (
    groupId: number,
    eventId: number,
): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/groups/${groupId}/events/${eventId}`);
