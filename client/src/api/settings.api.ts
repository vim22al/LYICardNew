import { fetcher } from './client'

export interface UpdateProfileData {
  name: string
  jobTitle?: string
}

export interface UpdatePasswordData {
  currentPassword?: string
  newPassword?: string
}

export const updateProfile = async (data: UpdateProfileData) => {
  return fetcher<any>('/settings/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export const updatePassword = async (data: UpdatePasswordData) => {
  return fetcher<any>('/settings/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export const getAdminSettings = async () => {
  return fetcher<any>('/settings/admin', {
    method: 'GET',
  })
}

export const updateAdminSettings = async (settings: Record<string, string>) => {
  return fetcher<any>('/settings/admin', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
}
