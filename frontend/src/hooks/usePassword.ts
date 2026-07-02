import { useMutation } from '@tanstack/react-query'
import { forgotPassword, resetPassword, changeEmail, type ChangeEmailRequest } from '../api/password'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword({ email }),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPassword({ token, newPassword }),
  })
}

export function useChangeEmail() {
  return useMutation({
    mutationFn: (data: ChangeEmailRequest) => changeEmail(data),
  })
}
