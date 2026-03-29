/**
 * POST /v1/scan
 * Scan content for prompt injection threats
 */

import { FastifyInstance } from 'fastify'
import { ScanAPI } from '@trustlayer/shared'
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
        },
      },
    },
  }, async (request, reply) => {
    const { content, source } = request.body

    try {
      // Scan content
      const result = await scanContent(content, source)

      // Persist to database (async, non-blocking)
      persistScanResult(result, source).catch(err => {
        server.log.error('Failed to persist scan result:', err)
      })

      return result
    } catch (error) {
      server.log.error('Scan failed:', error)
      return reply.status(500).send({
        error: {
          code: 'SCAN_FAILED',
          message: 'Failed to scan content',
        },
      })
    }
  })
}
