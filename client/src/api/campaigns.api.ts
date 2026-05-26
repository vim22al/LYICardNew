import { fetcher } from './client'
import type { Contact } from './contacts.api'
import type { Template } from './templates.api'

export interface Campaign {
  _id: string
  userId: string
  name: string
  templateId?: string | Template
  contacts: string[] | Contact[]
  status:
    | 'draft'
    | 'scheduled'
    | 'running'
    | 'completed'
    | 'failed'
    | 'cancelled'
  scheduledAt?: string
  lastSentAt?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export const campaignsApi = {
  getCampaigns: async (token: string) => {
    return fetcher<Campaign[]>('/campaigns', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  getCampaignById: async (id: string, token: string) => {
    return fetcher<Campaign>(`/campaigns/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  createCampaign: async (campaign: Partial<Campaign>, token: string) => {
    return fetcher<Campaign>('/campaigns', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(campaign),
    })
  },

  updateCampaign: async (
    id: string,
    updates: Partial<Campaign>,
    token: string,
  ) => {
    return fetcher<Campaign>(`/campaigns/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
  },

  deleteCampaign: async (id: string, token: string) => {
    return fetcher<any>(`/campaigns/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  addContacts: async (id: string, contactIds: string[], token: string) => {
    return fetcher<Campaign>(`/campaigns/${id}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contactIds }),
    })
  },

  removeContacts: async (id: string, contactIds: string[], token: string) => {
    return fetcher<Campaign>(`/campaigns/${id}/contacts`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contactIds }),
    })
  },

  setTemplate: async (id: string, templateId: string, token: string) => {
    return fetcher<Campaign>(`/campaigns/${id}/template`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ templateId }),
    })
  },

  sendCampaign: async (id: string, token: string) => {
    return fetcher<any>(`/campaigns/${id}/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
