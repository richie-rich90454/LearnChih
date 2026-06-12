import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login, register, verifyEmail } from '../api/auth'
import useAuthStore from '../store/authStore'
import type { AuthResponse } from '../types'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (response) => {
      const { token, ...user } = response.data
      setAuth(token, user as any)
      navigate('/')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      register(email, password, name),
    onSuccess: (_, variables) => {
      navigate(`/verify?email=${encodeURIComponent(variables.email)}`)
    },
  })
}

export function useVerifyEmail() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      verifyEmail(email, code),
    onSuccess: () => {
      navigate('/login')
    },
  })
}
