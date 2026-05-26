import { fetcher } from './client'

export interface Contact {
  _id: string
  userId: string
  name?: string
  title?: string
  company?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  rawImage?: string
  status: 'processing' | 'completed' | 'failed'
  additionalDetails?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export const contactsApi = {
  getContacts: async (token: string, params: Record<string, string> = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return fetcher<any[]>(`/contacts${queryString ? `?${queryString}` : ''}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  getContactById: async (id: string, token: string) => {
    return fetcher<any>(`/contacts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  updateContact: async (id: string, data: any, token: string) => {
    return fetcher<any>(`/contacts/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  },

  deleteContact: async (id: string, token: string) => {
    return fetcher<any>(`/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  scanCard: async (formData: FormData, token: string) => {
    // Note: Don't set Content-Type header manually for FormData,
    // fetch will set it correctly with the boundary
    return fetcher<any>('/contacts/scan', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
  },

  sendDefaultEmail: async (id: string, token: string) => {
    return fetcher<any>(`/contacts/${id}/send-default-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
