/**
 * User-related types for Decrity
 */

export type SubscriptionTier = 'free' | 'premium'

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial'

/**
 * User account information
 */
export interface User {
  id: string
  email?: string
  createdAt: string
  subscriptionTier: SubscriptionTier
  subscriptionStatus?: SubscriptionStatus
  settings: UserSettings
}

/**
 * User settings and preferences
 */
export interface UserSettings {
  protectionEnabled: boolean
  privacyMode: boolean
  notificationsEnabled: boolean
  alertLevel: 'all' | 'suspicious-and-threat' | 'threat-only'
  supportedPlatforms: {
    chatgpt: boolean
    gemini: boolean
    claude: boolean
    copilot: boolean
  }
}

/**
 * User statistics for dashboard
 */
export interface UserStats {
  totalScans: number
  threatsDetected: number
  suspiciousDetected: number
  lastScanAt?: string
  currentStreak: number // Days of continuous protection
}

/**
 * JWT token payload
 */
export interface JWTPayload {
  userId: string
  email?: string
  tier: SubscriptionTier
  iat: number
  exp: number
}
