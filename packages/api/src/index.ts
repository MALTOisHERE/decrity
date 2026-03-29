/**
 * TrustLayer API Server
 * Fastify-based REST API
 */

import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import { scanRoute } from './routes/scan.js'
import { reportRoute } from './routes/report.js'
import { userRoute } from './routes/user.js'

const PORT = parseInt(process.env.API_PORT || '3000')
const HOST = process.env.API_HOST || '0.0.0.0'

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
})

// CORS
await server.register(cors, {
  origin: true, // Allow all origins in development
  credentials: true,
})

// Rate limiting
await server.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '60'),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
})

// JWT authentication
await server.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
})

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Routes
await server.register(scanRoute, { prefix: '/v1' })
await server.register(reportRoute, { prefix: '/v1' })
await server.register(userRoute, { prefix: '/v1' })

// Start server
try {
  await server.listen({ port: PORT, host: HOST })
  console.log(`TrustLayer API server running on http://${HOST}:${PORT}`)
} catch (err) {
  server.log.error(err)
  process.exit(1)
}

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...')
  await server.close()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
