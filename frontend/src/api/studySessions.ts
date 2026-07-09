import type { AxiosResponse } from "axios";
import api from "./axios";

export type StudySessionType = "FOCUS" | "BREAK";

export interface StudySession {
    id: number;
    userId: number;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    type: StudySessionType;
    resourceId: number | null;
    createdAt: string;
}

export interface LogSessionRequest {
    startTime: string;
    endTime: string;
    durationMinutes: number;
    type: StudySessionType;
    resourceId?: number | null;
}

export const logStudySession = (
    data: LogSessionRequest,
): Promise<AxiosResponse<StudySession>> =>
    api.post<StudySession>("/study-sessions", data);

export const getWeeklyStudySessions = (): Promise<AxiosResponse<StudySession[]>> =>
    api.get<StudySession[]>("/study-sessions/weekly");
