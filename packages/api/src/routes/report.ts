/**
 * GET /v1/report
 * Get user's threat history
 */

import { FastifyInstance } from 'fastify'
import { ReportAPI } from '@decrity/shared'
import { getScanHistory } from '../services/database.js'

export async function reportRoute(server: FastifyInstance) {
  server.get<{
    Querystring: ReportAPI.Request
  }>('/report', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
    },
  }, async (request, reply) => {
    const { limit = 50, offset = 0 } = request.query

    try {
      // TODO: Get userId from JWT token (v1.5). Until then this matches
      // scan.ts's own unauthenticated writes: no user, so null, not a
      // placeholder string (ScanResult.userId is a nullable FK against
      // User; a non-existent placeholder id would violate that constraint).
      const userId = null

      const history = await getScanHistory(userId, { limit, offset })

      return history
    } catch (error) {
      server.log.error({ err: error }, 'Failed to fetch report')
      return reply.status(500).send({
        error: {
          code: 'REPORT_FAILED',
          message: 'Failed to fetch threat history',
        },
      })
    }
  })
}
