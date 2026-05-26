import { fetcher } from './client'

export const adminApi = {
  getStats: async (token: string) => {
    return fetcher<any>('/admin/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  getCharts: async (token: string) => {
    return fetcher<any>('/admin/dashboard/charts', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  getHealth: async (token: string) => {
    return fetcher<any>('/admin/dashboard/health', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  getActivity: async (token: string) => {
    return fetcher<any>('/admin/dashboard/activity', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  getTopUsers: async (token: string) => {
    return fetcher<any>('/admin/dashboard/top-users', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  getUserAnalytics: async (token: string) => {
    return fetcher<any>('/admin/analytics/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  getRevenueAnalytics: async (token: string) => {
    return fetcher<any>('/admin/analytics/revenue', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  listUsers: async (token: string, params: any) => {
    const query = new URLSearchParams(params).toString()
    return fetcher<any>(`/admin/users?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  getUser: async (token: string, userId: string) => {
    return fetcher<any>(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  updateUser: async (token: string, userId: string, data: any) => {
    return fetcher<any>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  listPlans: async (token: string) => {
    return fetcher<any>('/admin/plans', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  createPlan: async (token: string, data: any) => {
    return fetcher<any>('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  updatePlan: async (token: string, planId: string, data: any) => {
    return fetcher<any>(`/admin/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  deletePlan: async (token: string, planId: string) => {
    return fetcher<any>(`/admin/plans/${planId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}
