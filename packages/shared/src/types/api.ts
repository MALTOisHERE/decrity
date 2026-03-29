/**
 * API request/response types for TrustLayer
 */

import { ScanResponse, ThreatDetail, SupportedPlatform } from './scan'
import { User, UserSettings, UserStats } from './user'

/**
 * Standard API error response
 */
export interface APIError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

/**
 * POST /v1/scan - Scan content for threats
 */
export namespace ScanAPI {
  export interface Request {
    content: string
    source: SupportedPlatform
  }

  export interface Response extends ScanResponse {}
}

/**
 * GET /v1/report - Get user's threat history
 */
export namespace ReportAPI {
  export interface Request {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  }

  export interface Response {
    threats: ThreatDetail[]
    total: number
    hasMore: boolean
  }
}

/**
 * GET /v1/user - Get current user profile
 */
export namespace UserAPI {
  export interface GetResponse extends User {}

  /**
   * PATCH /v1/user - Update user settings
   */
  export interface UpdateRequest {
    settings?: Partial<UserSettings>
  }

  export interface UpdateResponse extends User {}
}

/**
 * GET /v1/user/stats - Get user statistics
 */
export namespace StatsAPI {
  export interface Response extends UserStats {}
}

/**
 * POST /v1/auth/login - User authentication (future)
 */
export namespace AuthAPI {
  export interface LoginRequest {
    email: string
    password: string
  }

  export interface LoginResponse {
    token: string
    user: User
  }

  export interface RegisterRequest {
    email: string
    password: string
  }

  export interface RegisterResponse {
    token: string
    user: User
  }
}
