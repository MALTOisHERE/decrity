import { useQuery } from '@tanstack/react-query'
import { fetchUserStats, fetchThreatHistory } from './api'

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: fetchUserStats,
  })
}

export function useThreatHistory(options: { limit: number; offset: number }) {
  return useQuery({
    queryKey: ['threat-history', options.limit, options.offset],
    queryFn: () => fetchThreatHistory(options),
  })
}
