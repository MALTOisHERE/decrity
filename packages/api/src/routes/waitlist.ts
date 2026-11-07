/**
 * POST /v1/waitlist
 * Join the pre-launch waitlist from the landing page. Stores only the
 * email; sending the "it's live" announcement is a manual step for now.
 */

import { FastifyInstance } from 'fastify'
import { WaitlistAPI } from '@decrity/shared'
import { persistWaitlistSignup } from '../services/database.js'

export async function waitlistRoute(server: FastifyInstance) {
  server.post<{
    Body: WaitlistAPI.Request
  }>('/waitlist', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          // No ajv-formats plugin registered, so "format: email" isn't
          // available: a basic pattern is enough to reject obvious garbage,
          // real validation (does this address exist) happens by the email
          // bouncing when the launch announcement is sent.
          email: { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', maxLength: 320 },
        },
      },
    },
  }, async (request, reply) => {
    const { email } = request.body

    try {
      await persistWaitlistSignup(email.trim().toLowerCase())

      const response: WaitlistAPI.Response = { joined: true }
      return response
    } catch (error) {
      server.log.error({ err: error }, 'Failed to persist waitlist signup')
      return reply.status(500).send({
        error: {
          code: 'WAITLIST_SIGNUP_FAILED',
          message: 'Failed to join waitlist',
        },
      })
    }
  })
}
