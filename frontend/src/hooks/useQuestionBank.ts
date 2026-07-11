import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import {
    type QuestionBankItem,
    type QuestionBankPayload,
    listQuestionBank,
    createQuestionBank,
    updateQuestionBank,
    deleteQuestionBank,
    importQuestionIntoQuiz,
} from "../api/questionBank";

export type { QuestionBankItem, QuestionBankPayload };

const BANK_KEY = ["question-bank"] as const;

/**
 * Lists the current user's question bank entries (F18). Optional tag or
 * text query filters server-side.
 */
export function useQuestionBank(tag?: string, query?: string) {
    return useQuery<QuestionBankItem[]>({
        queryKey: [...BANK_KEY, { tag, query }],
        queryFn: () => listQuestionBank({ tag, query }).then((r) => r.data),
    });
}

/** Creates a new bank question, then refreshes the list. */
export function useCreateQuestionBank() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: QuestionBankPayload) =>
            createQuestionBank(payload).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BANK_KEY });
        },
    });
}

/** Updates a bank question, then refreshes the list. */
export function useUpdateQuestionBank() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: QuestionBankPayload }) =>
            updateQuestionBank(id, payload).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BANK_KEY });
        },
    });
}

/** Deletes a bank question, then refreshes the list. */
export function useDeleteQuestionBank() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteQuestionBank(id).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BANK_KEY });
        },
    });
}

/** Imports a bank question into an existing quiz. */
export function useImportQuestion() {
    return useMutation({
        mutationFn: ({ id, quizId }: { id: number; quizId: number }) =>
            importQuestionIntoQuiz(id, quizId).then((r) => r.data),
    });
}

/** Lists quizzes so the import dialog can pick a target quiz. */
export function useQuizzesForImport() {
    return useQuery<Array<{ id: number; title: string }>>({
        queryKey: ["quizzes", "import"],
        queryFn: () => api.get<Array<{ id: number; title: string }>>("/quizzes").then((r) => r.data),
    });
}
