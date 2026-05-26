import { fetcher } from './client'

export interface Template {
  _id: string
  name: string
  type: 'email' | 'whatsapp'
  subject?: string
  header?: string
  body: string
  isDefault: boolean
  attachments?: {
    filename: string
    size: number
    contentType: string
    _id: string
  }[]
  createdAt: string
  updatedAt: string
}

export const templatesApi = {
  getTemplates: async (
    token: string,
    params?: { type?: string; search?: string },
  ) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined),
    ) as Record<string, string>
    const queryString = new URLSearchParams(cleanParams).toString()
    return fetcher<Template[]>(
      `/templates${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  },

  getTemplateById: async (id: string, token: string) => {
    return fetcher<Template>(`/templates/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  createTemplate: async (data: FormData, token: string) => {
    return fetcher<Template>('/templates', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type is set automatically by the browser for FormData
      },
      body: data,
    })
  },

  updateTemplate: async (id: string, data: FormData, token: string) => {
    return fetcher<Template>(`/templates/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type is set automatically by the browser for FormData
      },
      body: data,
    })
  },

  deleteTemplate: async (id: string, token: string) => {
    return fetcher<any>(`/templates/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
