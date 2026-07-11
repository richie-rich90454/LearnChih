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

/** Quiz take mode (F16). TIMED = countdown, MASTERY = re-queue wrong, ADAPTIVE = early finish. */
export type QuizMode = "TIMED" | "MASTERY" | "ADAPTIVE";

/** Options for persisting a generated quiz (F5 + F16). */
export interface SaveQuizOptions {
    quizTitle: string;
    questions: GeneratedQuizQuestion[];
    mode?: QuizMode;
    timeLimitSeconds?: number | null;
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
 * Persist generated quiz questions into a new quiz (F5). Since F16 the
 * quiz mode and optional time limit are sent alongside the title + questions.
 */
export const saveAiQuiz = (
    resourceId: number,
    options: SaveQuizOptions,
): Promise<AxiosResponse<SaveQuizResponse>> =>
    api.post<SaveQuizResponse>(
        `/resources/${resourceId}/ai-quiz/save`,
        {
            quizTitle: options.quizTitle,
            questions: options.questions,
            mode: options.mode ?? "TIMED",
            timeLimitSeconds: options.timeLimitSeconds ?? null,
        },
    );
