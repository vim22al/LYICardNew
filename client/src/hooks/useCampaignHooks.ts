import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { campaignsApi } from '../api/campaigns.api'
import type { Campaign } from '../api/campaigns.api'
import { useAuthStore } from '@/stores/useAuthStore'

export const CAMPAIGN_KEYS = {
  all: ['campaigns'] as const,
  list: () => [...CAMPAIGN_KEYS.all, 'list'] as const,
  detail: (id: string) => [...CAMPAIGN_KEYS.all, 'detail', id] as const,
}

export function useCampaignsQuery() {
  const token = useAuthStore((state) => state.token)
  return useQuery({
    queryKey: CAMPAIGN_KEYS.list(),
    queryFn: () => campaignsApi.getCampaigns(token as string),
    enabled: !!token,
    refetchInterval: 5000, // Poll every 5s for status updates
  })
}

export function useCampaignByIdQuery(id: string) {
  const token = useAuthStore((state) => state.token)
  return useQuery({
    queryKey: CAMPAIGN_KEYS.detail(id),
    queryFn: () => campaignsApi.getCampaignById(id, token as string),
    enabled: !!token && !!id,
  })
}

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)

  return useMutation({
    mutationFn: (campaign: Partial<Campaign>) =>
      campaignsApi.createCampaign(campaign, token as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEYS.list() })
    },
  })
}

export function useUpdateCampaignMutation() {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Campaign> }) =>
      campaignsApi.updateCampaign(id, updates, token as string),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEYS.list() })
      queryClient.invalidateQueries({
        queryKey: CAMPAIGN_KEYS.detail(variables.id),
      })
    },
  })
}

export function useDeleteCampaignMutation() {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)

  return useMutation({
    mutationFn: (id: string) =>
      campaignsApi.deleteCampaign(id, token as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEYS.list() })
    },
  })
}

export function useSendCampaignMutation() {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)

  return useMutation({
    mutationFn: (id: string) => campaignsApi.sendCampaign(id, token as string),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEYS.detail(id) })
    },
  })
}
