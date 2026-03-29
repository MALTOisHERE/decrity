/**
 * User routes
 * GET /v1/user - Get current user
 * PATCH /v1/user - Update user settings
 */

import { FastifyInstance } from 'fastify'
import { UserAPI } from '@trustlayer/shared'

export async function userRoute(server: FastifyInstance) {
  // GET /v1/user
  server.get('/user', async (request, reply) => {
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
  }>('/user', async (request, reply) => {
    // TODO: Implement user settings update
    return reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'User accounts not yet implemented',
      },
    })
  })
}
