/**
 * POST /v1/gap-report
 * Report that a platform's Protection Gap detection found its known
 * selector(s) missing. No auth required: anonymous installs (common in
 * Privacy Mode) must still be able to report a gap (ticket 003).
 */

import { FastifyInstance } from 'fastify'
import { GapReportAPI } from '@decrity/shared'
import { persistGapReport } from '../services/database.js'

export async function gapReportRoute(server: FastifyInstance) {
  server.post<{
    Body: GapReportAPI.Request
  }>('/gap-report', {
    schema: {
      body: {
        type: 'object',
        required: ['source', 'timestamp', 'extensionVersion'],
        properties: {
          source: { type: 'string', enum: ['chatgpt', 'gemini', 'claude', 'copilot'] },
          timestamp: { type: 'number' },
          extensionVersion: { type: 'string', minLength: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { source, timestamp, extensionVersion } = request.body

    try {
      await persistGapReport(source, timestamp, extensionVersion)

      const response: GapReportAPI.Response = { received: true }
      return response
    } catch (error) {
      server.log.error({ err: error }, 'Failed to persist gap report')
      return reply.status(500).send({
        error: {
          code: 'GAP_REPORT_FAILED',
          message: 'Failed to record gap report',
        },
      })
    }
  })
}
