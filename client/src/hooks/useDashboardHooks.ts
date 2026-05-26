import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard.api'
import { useAuthStore } from '@/stores/useAuthStore'

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
}

export function useDashboardQuery() {
  const token = useAuthStore((state) => state.token)
  return useQuery({
    queryKey: DASHBOARD_KEYS.all,
    queryFn: () => dashboardApi.getDashboardData(token as string),
    enabled: !!token,
    refetchInterval: 30000, // Refresh every 30s
  })
}
