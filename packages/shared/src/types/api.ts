/**
 * API request/response types for Decrity
 */

import { ScanResponse, ScanVerdict, ThreatDetail, SupportedPlatform } from './scan'
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
    /**
     * The extension's own Layer 1 result, computed locally before this
     * request was made. Lets the API fail safe to this instead of a
     * hardcoded 'clean' if Layer 2 (the ML service) is unreachable, rather
     * than silently discarding a result the extension already flagged.
     */
    heuristic?: {
      verdict: ScanVerdict
      score: number
      reason: string
    }
  }

  export interface Response extends ScanResponse {}
}

/**
 * POST /v1/gap-report - Report that a platform's Protection Gap detection
 * found its known selector(s) missing. No content, no selector text, no
 * page data (see .wayfinder/tickets/003-gap-report-contract.md).
 */
export namespace GapReportAPI {
  export interface Request {
    source: SupportedPlatform
    timestamp: number
    extensionVersion: string
  }

  export interface Response {
    received: boolean
  }
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
  export interface Response extends UserStats {
    verdictBreakdown: {
      clean: number
      suspicious: number
      threat: number
    }
  }
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
