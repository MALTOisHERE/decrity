/**
 * User routes
 * GET /v1/user - Get current user
 * PATCH /v1/user - Update user settings
 */

import { FastifyInstance } from 'fastify'
import { UserAPI, StatsAPI } from '@decrity/shared'
import { getUserStats } from '../services/database.js'

export async function userRoute(server: FastifyInstance) {
  // GET /v1/user
  server.get('/user', async (_request, reply) => {
    // TODO: Implement user retrieval
    return reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'User accounts not yet implemented',
      },
    })
  })

  // PATCH /v1/user
  server.patch<{
    Body: UserAPI.UpdateRequest
  }>('/user', async (_request, reply) => {
    // TODO: Implement user settings update
    return reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'User accounts not yet implemented',
      },
    })
  })

  // GET /v1/user/stats
  server.get('/user/stats', async (_request, reply) => {
    try {
      // TODO: real auth (v1.5), see report.ts's matching null-userId note
      const stats = await getUserStats(null)
      const response: StatsAPI.Response = stats
      return response
    } catch (error) {
      server.log.error({ err: error }, 'Failed to fetch user stats')
      return reply.status(500).send({
        error: {
          code: 'STATS_FAILED',
          message: 'Failed to fetch statistics',
        },
      })
    }
  })
}
