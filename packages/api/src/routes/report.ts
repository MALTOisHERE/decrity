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
  }>('/report', async (request, reply) => {
    const { limit = 50, offset = 0 } = request.query

    try {
      // TODO: Get userId from JWT token
      const userId = 'anonymous' // Placeholder

      const history = await getScanHistory(userId, { limit, offset })

      return history
    } catch (error) {
      server.log.error('Failed to fetch report:', error)
      return reply.status(500).send({
        error: {
          code: 'REPORT_FAILED',
          message: 'Failed to fetch threat history',
        },
      })
    }
  })
}
