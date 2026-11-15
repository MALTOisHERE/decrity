import Fastify from 'fastify'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { persistWaitlistSignup } = vi.hoisted(() => ({
  persistWaitlistSignup: vi.fn(),
}))

vi.mock('../services/database.js', () => ({ persistWaitlistSignup }))

import { waitlistRoute } from './waitlist.js'

async function buildServer() {
  const app = Fastify()
  await app.register(waitlistRoute)
  return app
}

describe('POST /waitlist', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('accepts a well-formed email and stores it lowercased', async () => {
    persistWaitlistSignup.mockResolvedValue(undefined)
    const app = await buildServer()

    const res = await app.inject({
      method: 'POST',
      url: '/waitlist',
      payload: { email: 'Test@Example.com' },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ joined: true })
    expect(persistWaitlistSignup).toHaveBeenCalledWith('test@example.com')
    await app.close()
  })

  it('trims incidental whitespace before validation, not after', async () => {
    persistWaitlistSignup.mockResolvedValue(undefined)
    const app = await buildServer()

    const res = await app.inject({
      method: 'POST',
      url: '/waitlist',
      payload: { email: '  test@example.com  ' },
    })

    expect(res.statusCode).toBe(200)
    expect(persistWaitlistSignup).toHaveBeenCalledWith('test@example.com')
    await app.close()
  })

  it('rejects an address with no @ sign', async () => {
    const app = await buildServer()
    const res = await app.inject({ method: 'POST', url: '/waitlist', payload: { email: 'not-an-email' } })
    expect(res.statusCode).toBe(400)
    expect(persistWaitlistSignup).not.toHaveBeenCalled()
    await app.close()
  })

  it('rejects an address with no domain suffix', async () => {
    const app = await buildServer()
    const res = await app.inject({ method: 'POST', url: '/waitlist', payload: { email: 'test@example' } })
    expect(res.statusCode).toBe(400)
    await app.close()
  })

  it('rejects a request missing the email field entirely', async () => {
    const app = await buildServer()
    const res = await app.inject({ method: 'POST', url: '/waitlist', payload: {} })
    expect(res.statusCode).toBe(400)
    await app.close()
  })

  it('returns a generic 500 when persistence fails, without leaking the internal error', async () => {
    persistWaitlistSignup.mockRejectedValue(new Error('db down'))
    const app = await buildServer()

    const res = await app.inject({
      method: 'POST',
      url: '/waitlist',
      payload: { email: 'test@example.com' },
    })

    expect(res.statusCode).toBe(500)
    expect(JSON.parse(res.body).error.code).toBe('WAITLIST_SIGNUP_FAILED')
    await app.close()
  })
})
