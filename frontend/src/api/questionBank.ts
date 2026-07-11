import type { AxiosResponse } from "axios";
import api from "./axios";

/** A reusable multiple-choice question in the user's question bank (F18). */
export interface QuestionBankItem {
    id: number;
    ownerUserId: number;
    question: string;
    options: string[];
    answerIndex: number;
    explanation?: string;
    tags: string;
    createdAt: string;
}

/** Payload for creating or updating a bank question. */
export interface QuestionBankPayload {
    question: string;
    options: string[];
    answerIndex: number;
    explanation?: string;
    tags?: string;
}

/** Result of importing a bank question into a quiz. */
export interface ImportResult {
    quizQuestionId: number;
    quizId: number;
}

/** Lists the current user's bank entries, optionally filtered by tag or text. */
export const listQuestionBank = (
    params?: { tag?: string; query?: string },
): Promise<AxiosResponse<QuestionBankItem[]>> =>
    api.get<QuestionBankItem[]>("/question-bank", { params });

/** Fetches a single bank question. */
export const getQuestionBank = (id: number): Promise<AxiosResponse<QuestionBankItem>> =>
    api.get<QuestionBankItem>(`/question-bank/${id}`);

/** Creates a new bank question. */
export const createQuestionBank = (
    payload: QuestionBankPayload,
): Promise<AxiosResponse<QuestionBankItem>> =>
    api.post<QuestionBankItem>("/question-bank", payload);

/** Updates an existing bank question. */
export const updateQuestionBank = (
    id: number,
    payload: QuestionBankPayload,
): Promise<AxiosResponse<QuestionBankItem>> =>
    api.put<QuestionBankItem>(`/question-bank/${id}`, payload);

/** Deletes a bank question. */
export const deleteQuestionBank = (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/question-bank/${id}`);

/** Imports a bank question into an existing quiz (copies it as a new question). */
export const importQuestionIntoQuiz = (
    id: number,
    quizId: number,
): Promise<AxiosResponse<ImportResult>> =>
    api.post<ImportResult>(`/question-bank/${id}/import`, { quizId });
