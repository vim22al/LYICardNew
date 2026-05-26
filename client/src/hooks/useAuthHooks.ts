import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'

export const useLoginMutation = () => {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: any) => authApi.login(data),
    onSuccess: (resData) => {
      setAuth(resData.user, resData.token)
      toast.success('Welcome back!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useSignupMutation = () => {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: any) => authApi.signup(data),
    onSuccess: (resData) => {
      setAuth(resData.user, resData.token)
      toast.success('Account created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useGoogleLoginMutation = () => {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: { idToken?: string; accessToken?: string }) =>
      authApi.googleLogin(data),
    onSuccess: (resData) => {
      setAuth(resData.user, resData.token)
      toast.success('Signed in with Google!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Google login failed')
    },
  })
}

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: (data) => {
      toast.success(data.message || 'Check your email for reset link')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useResetPasswordMutation = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: any) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully! You can now login.')
      navigate({ to: '/auth/login' })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
