import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "../api/axios";
import type { QuizMode } from "../api/aiQuiz";

export type { QuizMode };

/**
 * A single multiple-choice question within a quiz.
 * Spec ref: F6.49.
 */
export interface QuizQuestion {
    id: number;
    quizId: number;
    question: string;
    options: string[];
    /** Index of the correct option. Returned by server on submission review. */
    correctOptionIndex?: number;
    explanation?: string;
}

/**
 * A quiz containing one or more questions.
 * Spec ref: F6.49.
 */
export interface Quiz {
    id: number;
    title: string;
    description?: string;
    mode?: QuizMode;
    timeLimitSeconds?: number | null;
    passingScore?: number;
    questions: QuizQuestion[];
}

/** A user's answer to a single question. */
export interface QuizAnswer {
    questionId: number;
    selectedOptionIndex: number;
}

/** Result returned after submitting a quiz. */
export interface QuizResult {
    quizId: number;
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    details: Array<{
        questionId: number;
        selectedOptionIndex: number;
        correctOptionIndex: number;
        correct: boolean;
    }>;
}

/** Lists all quizzes. Spec ref: F6.49. */
export function useQuizzes() {
    return useQuery<Quiz[]>({
        queryKey: ["quizzes"],
        queryFn: () => api.get<Quiz[]>("/quizzes").then((r) => r.data),
    });
}

/** Fetches a single quiz with its questions. Spec ref: F6.49. */
export function useQuiz(id: string | number | undefined) {
    return useQuery<Quiz>({
        queryKey: ["quiz", id],
        queryFn: () => api.get<Quiz>(`/quizzes/${id}`).then((r) => r.data),
        enabled: !!id,
    });
}

/**
 * Submits quiz answers and returns the graded result.
 * Spec ref: F6.50.
 */
export function useSubmitQuiz(quizId: string | number | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (answers: QuizAnswer[]): Promise<AxiosResponse<QuizResult>> =>
            api.post<QuizResult>(`/quizzes/${quizId}/submit`, { answers }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
            queryClient.invalidateQueries({ queryKey: ["quizzes"] });
        },
    });
}

/** Per-question analytics (F17). */
export interface QuestionAnalytics {
    questionId: number;
    question: string;
    timesAttempted: number;
    timesCorrect: number;
    /** Proportion correct (0-1). Lower = harder. */
    difficulty: number;
    /** avg(score|correct) - avg(score|wrong). Higher = better discriminator. */
    discrimination: number;
}

export interface QuizAnalytics {
    quizId: number;
    title: string;
    questions: QuestionAnalytics[];
}

/** Fetches aggregate analytics for a quiz (F17). */
export function useQuizAnalytics(id: string | number | undefined) {
    return useQuery<QuizAnalytics>({
        queryKey: ["quiz-analytics", id],
        queryFn: () => api.get<QuizAnalytics>(`/quizzes/${id}/analytics`).then((r) => r.data),
        enabled: !!id,
    });
}
