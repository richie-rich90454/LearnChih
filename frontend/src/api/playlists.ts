import type { AxiosResponse } from "axios";
import api from "./axios";

export interface Playlist {
    id: number;
    userId: number;
    name: string;
    description: string;
    createdAt: string;
    itemCount: number;
}

export interface PlaylistItem {
    id: number;
    playlistId: number;
    resourceId: number;
    resourceTitle: string;
    sortOrder: number;
    addedAt: string;
}

export interface PlaylistDetail extends Omit<Playlist, "itemCount"> {
    itemCount: number;
    items: PlaylistItem[];
}

export interface CreatePlaylistRequest {
    name: string;
    description?: string;
}

export interface AddItemRequest {
    resourceId: number;
}

export const getPlaylists = (): Promise<AxiosResponse<Playlist[]>> =>
    api.get<Playlist[]>("/playlists");

export const getPlaylist = (id: number): Promise<AxiosResponse<PlaylistDetail>> =>
    api.get<PlaylistDetail>(`/playlists/${id}`);

export const createPlaylist = (
    data: CreatePlaylistRequest,
): Promise<AxiosResponse<Playlist>> => api.post<Playlist>("/playlists", data);

export const deletePlaylist = (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/playlists/${id}`);

export const addPlaylistItem = (
    playlistId: number,
    data: AddItemRequest,
): Promise<AxiosResponse<PlaylistItem>> =>
    api.post<PlaylistItem>(`/playlists/${playlistId}/items`, data);

export const removePlaylistItem = (
    playlistId: number,
    itemId: number,
): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/playlists/${playlistId}/items/${itemId}`);

export const movePlaylistItem = (
    playlistId: number,
    itemId: number,
    direction: "up" | "down",
): Promise<AxiosResponse<PlaylistItem[]>> =>
    api.post<PlaylistItem[]>(`/playlists/${playlistId}/items/${itemId}/move`, null, {
        params: { direction },
    });
