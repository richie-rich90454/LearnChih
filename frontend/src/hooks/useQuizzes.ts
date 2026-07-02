import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import api from '../api/axios'

/**
 * A single multiple-choice question within a quiz.
 * Spec ref: F6.49.
 */
export interface QuizQuestion {
  id: number
  quizId: number
  question: string
  options: string[]
  /** Index of the correct option. Returned by server on submission review. */
  correctOptionIndex?: number
}

/**
 * A quiz containing one or more questions.
 * Spec ref: F6.49.
 */
export interface Quiz {
  id: number
  title: string
  description?: string
  passingScore?: number
  questions: QuizQuestion[]
}

/** A user's answer to a single question. */
export interface QuizAnswer {
  questionId: number
  selectedOptionIndex: number
}

/** Result returned after submitting a quiz. */
export interface QuizResult {
  quizId: number
  score: number
  totalQuestions: number
  percentage: number
  passed: boolean
  details: Array<{
    questionId: number
    selectedOptionIndex: number
    correctOptionIndex: number
    correct: boolean
  }>
}

/** Lists all quizzes. Spec ref: F6.49. */
export function useQuizzes() {
  return useQuery<Quiz[]>({
    queryKey: ['quizzes'],
    queryFn: () => api.get<Quiz[]>('/quizzes').then((r) => r.data),
  })
}

/** Fetches a single quiz with its questions. Spec ref: F6.49. */
export function useQuiz(id: string | number | undefined) {
  return useQuery<Quiz>({
    queryKey: ['quiz', id],
    queryFn: () => api.get<Quiz>(`/quizzes/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

/**
 * Submits quiz answers and returns the graded result.
 * Spec ref: F6.50.
 */
export function useSubmitQuiz(quizId: string | number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (answers: QuizAnswer[]): Promise<AxiosResponse<QuizResult>> =>
      api.post<QuizResult>(`/quizzes/${quizId}/submit`, { answers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })
}
