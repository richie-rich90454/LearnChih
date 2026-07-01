/// <reference types="vite/client" />
import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().optional(),
  VITE_WS_BASE_URL: z.string().optional(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables. See console for details.')
}

export const env = parsed.data
export type Env = z.infer<typeof envSchema>
