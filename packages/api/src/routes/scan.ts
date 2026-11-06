/**
 * POST /v1/scan
 * Scan content for prompt injection threats
 */

import { FastifyInstance } from 'fastify'
import { ScanAPI } from '@decrity/shared'
import { scanContent } from '../services/scanner.js'
import { persistScanResult } from '../services/database.js'

export async function scanRoute(server: FastifyInstance) {
  server.post<{
    Body: ScanAPI.Request
  }>('/scan', {
    schema: {
      body: {
        type: 'object',
        required: ['content', 'source'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 50000 },
          source: { type: 'string', enum: ['chatgpt', 'gemini', 'claude', 'copilot'] },
          heuristic: {
            type: 'object',
            properties: {
              verdict: { type: 'string', enum: ['clean', 'suspicious', 'threat'] },
              score: { type: 'number', minimum: 0, maximum: 1 },
              reason: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { content, source, heuristic } = request.body

    try {
      // Scan content. `heuristic` is the extension's own Layer 1 result,
      // used as the fallback if Layer 2 (ML service) is unreachable, see
      // scanContent's own doc comment and PROGRESS.md's Known Issues #5.
      const result = await scanContent(content, source, heuristic)

      // Persist to database (async, non-blocking). No userId until JWT
      // accounts exist (v1.5): ScanResult.userId is a nullable FK against
      // User, so it must stay unset/null rather than a placeholder string
      // like 'anonymous', which would violate the FK constraint since no
      // such User row exists. report.ts's history read matches this same
      // null convention.
      persistScanResult(result, source).catch(err => {
        server.log.error({ err }, 'Failed to persist scan result')
      })

      return result
    } catch (error) {
      server.log.error({ err: error }, 'Scan failed')
      return reply.status(500).send({
        error: {
          code: 'SCAN_FAILED',
          message: 'Failed to scan content',
        },
      })
    }
  })
}
