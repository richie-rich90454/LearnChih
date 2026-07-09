import type { AxiosResponse } from "axios";
import api from "./axios";

export interface GeneratedQuizQuestion {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
}

export interface GenerateQuizResponse {
    questions: GeneratedQuizQuestion[];
}

export interface SaveQuizResponse {
    quizId: number;
    savedCount: number;
}

/**
 * Trigger mock AI quiz generation for a resource (F5). The backend derives
 * multiple-choice questions from the resource's title + description.
 */
export const generateAiQuiz = (
    resourceId: number,
): Promise<AxiosResponse<GenerateQuizResponse>> =>
    api.post<GenerateQuizResponse>(`/resources/${resourceId}/ai-quiz/generate`);

/**
 * Persist generated quiz questions into a new quiz (F5).
 */
export const saveAiQuiz = (
    resourceId: number,
    quizTitle: string,
    questions: GeneratedQuizQuestion[],
): Promise<AxiosResponse<SaveQuizResponse>> =>
    api.post<SaveQuizResponse>(
        `/resources/${resourceId}/ai-quiz/save`,
        { quizTitle, questions },
    );
