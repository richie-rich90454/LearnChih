import type { AxiosResponse } from "axios";
import api from "./axios";

export interface ModuleInfo {
    id: number;
    courseId: number;
    title: string;
    sortOrder: number;
    durationMinutes: number | null;
}

export interface ModuleProgressItem {
    module: ModuleInfo;
    completed: boolean;
    completedAt: string | null;
    score: number | null;
}

export interface CourseProgress {
    courseId: number;
    courseName: string | null;
    completedCount: number;
    totalModules: number;
    modules: ModuleProgressItem[];
}

export const getCourseProgress = (
    courseId: number,
): Promise<AxiosResponse<CourseProgress>> =>
    api.get<CourseProgress>(`/courses/${courseId}/progress`);

export const completeModule = (
    courseId: number,
    moduleId: number,
    score?: number,
): Promise<AxiosResponse<ModuleProgressItem>> =>
    api.post<ModuleProgressItem>(
        `/courses/${courseId}/progress/modules/${moduleId}/complete`,
        score !== undefined ? { score } : null,
    );

export const uncompleteModule = (
    courseId: number,
    moduleId: number,
): Promise<AxiosResponse<void>> =>
    api.delete<void>(
        `/courses/${courseId}/progress/modules/${moduleId}/complete`,
    );
