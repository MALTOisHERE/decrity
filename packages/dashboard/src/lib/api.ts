import { API_ENDPOINTS, StatsAPI, ReportAPI } from '@decrity/shared'

const API_BASE_URL = import.meta.env.VITE_DASHBOARD_API_URL || 'http://localhost:3000'

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Request to ${path} failed: ${response.status}`)
  }
  return response.json()
}

export function fetchUserStats(): Promise<StatsAPI.Response> {
  return apiFetch<StatsAPI.Response>(API_ENDPOINTS.USER_STATS)
}

export function fetchThreatHistory(options: { limit: number; offset: number }): Promise<ReportAPI.Response> {
  const params = new URLSearchParams({
    limit: String(options.limit),
    offset: String(options.offset),
  })
  return apiFetch<ReportAPI.Response>(`${API_ENDPOINTS.REPORT}?${params}`)
}
