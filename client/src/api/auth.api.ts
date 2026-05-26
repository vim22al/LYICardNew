import { fetcher } from './client'

export const authApi = {
  login: async (data: any) => {
    return fetcher<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  signup: async (data: any) => {
    return fetcher<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  googleLogin: async (data: { idToken?: string; accessToken?: string }) => {
    return fetcher<any>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  forgotPassword: async (email: string) => {
    return fetcher<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  resetPassword: async (data: any) => {
    return fetcher<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
