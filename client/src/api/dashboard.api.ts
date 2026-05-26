import { fetcher } from './client'
import type { Contact } from './contacts.api'
import type { Campaign } from './campaigns.api'

export interface DashboardData {
  stats: {
    totalContacts: number
    totalCampaigns: number
    totalTemplates: number
    totalReach: number
  }
  analytics: {
    scansOverTime: Array<{ _id: string; count: number }>
    campaignStatus: Array<{ _id: string; count: number }>
  }
  recentActivity: {
    contacts: Partial<Contact>[]
    campaigns: Partial<Campaign>[]
  }
}

export const dashboardApi = {
  getDashboardData: async (token: string) => {
    return fetcher<DashboardData>('/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
