/**
 * Shared constants for Decrity
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  SCAN: '/v1/scan',
  REPORT: '/v1/report',
  USER: '/v1/user',
  USER_STATS: '/v1/user/stats',
  AUTH_LOGIN: '/v1/auth/login',
  AUTH_REGISTER: '/v1/auth/register',
  GAP_REPORT: '/v1/gap-report',
  WAITLIST: '/v1/waitlist',
} as const

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  SCAN_RESULT_TTL: 3600000, // 1 hour in milliseconds
  MAX_CACHE_ENTRIES: 1000,
  CLEANUP_INTERVAL: 3600000, // 1 hour
} as const

/**
 * Threat detection thresholds
 */
export const THREAT_THRESHOLDS = {
  CLEAN_MAX: 0.3,
  SUSPICIOUS_MIN: 0.3,
  SUSPICIOUS_MAX: 0.7,
  THREAT_MIN: 0.7,
} as const

/**
 * Extension badge colors
 */
export const BADGE_COLORS = {
  CLEAN: '#10b981', // green
  SUSPICIOUS: '#f59e0b', // amber
  THREAT: '#ef4444', // red
  DISABLED: '#6b7280', // gray
  GAP: '#2F6F78', // deep teal — tool-health signal, never a content-danger or disabled color
} as const

/**
 * Extension badge text
 */
export const BADGE_TEXT = {
  CLEAN: '✓',
  SUSPICIOUS: '!',
  THREAT: '⚠',
  DISABLED: '○',
  GAP: ' ', // deliberately blank: a bare teal dot on the toolbar, not a character someone has to decode
} as const

/**
 * Storage keys for chrome.storage
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'decrity_auth_token',
  USER_ID: 'decrity_user_id',
  SETTINGS: 'decrity_settings',
  PRIVACY_MODE: 'decrity_privacy_mode',
  LAST_SYNC: 'decrity_last_sync',
  PROTECTION_GAP_STATE: 'decrity_gap_state',
  GAP_REPORTS: 'decrity_gap_reports',
} as const

/**
 * Rate limiting
 */
export const RATE_LIMITS = {
  SCANS_PER_MINUTE: 60,
  API_REQUESTS_PER_MINUTE: 100,
} as const

/**
 * Data retention
 */
export const RETENTION = {
  FREE_TIER_DAYS: 7,
  PREMIUM_TIER_DAYS: 365,
  CONTENT_HASH_DAYS: 90,
} as const
