import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    scanResult: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
    },
    gapReport: {
      create: vi.fn(),
    },
    waitlistSignup: {
      upsert: vi.fn(),
    },
  },
}))

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}))

import { getScanHistory, getUserStats } from './database.js'

function daysAgo(n: number): Date {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() - n)
  return d
}

describe('getUserStats', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('computes the verdict breakdown from the raw counts', async () => {
    mockPrisma.scanResult.count
      .mockResolvedValueOnce(10) // totalScans
      .mockResolvedValueOnce(3) // threatsDetected
      .mockResolvedValueOnce(2) // suspiciousDetected
    mockPrisma.scanResult.findFirst.mockResolvedValue(null)
    mockPrisma.scanResult.findMany.mockResolvedValue([])

    const stats = await getUserStats('user-1')

    expect(stats.verdictBreakdown).toEqual({ clean: 5, suspicious: 2, threat: 3 })
  })

  it('counts a streak of consecutive days ending today', async () => {
    mockPrisma.scanResult.count.mockResolvedValue(0)
    mockPrisma.scanResult.findFirst.mockResolvedValue(null)
    mockPrisma.scanResult.findMany.mockResolvedValue([
      { createdAt: daysAgo(0) },
      { createdAt: daysAgo(1) },
      { createdAt: daysAgo(2) },
    ])

    const stats = await getUserStats('user-1')

    expect(stats.currentStreak).toBe(3)
  })

  it('stops the streak at the first gap, even with later matching days', async () => {
    mockPrisma.scanResult.count.mockResolvedValue(0)
    mockPrisma.scanResult.findFirst.mockResolvedValue(null)
    mockPrisma.scanResult.findMany.mockResolvedValue([
      { createdAt: daysAgo(0) },
      // day -1 missing: streak should stop here
      { createdAt: daysAgo(2) },
    ])

    const stats = await getUserStats('user-1')

    expect(stats.currentStreak).toBe(1)
  })

  it('reports a zero streak when there are no scans at all', async () => {
    mockPrisma.scanResult.count.mockResolvedValue(0)
    mockPrisma.scanResult.findFirst.mockResolvedValue(null)
    mockPrisma.scanResult.findMany.mockResolvedValue([])

    const stats = await getUserStats('user-1')

    expect(stats.currentStreak).toBe(0)
  })

  it('reports a zero streak when today has no scan, even if yesterday does', async () => {
    mockPrisma.scanResult.count.mockResolvedValue(0)
    mockPrisma.scanResult.findFirst.mockResolvedValue(null)
    mockPrisma.scanResult.findMany.mockResolvedValue([{ createdAt: daysAgo(1) }])

    const stats = await getUserStats('user-1')

    expect(stats.currentStreak).toBe(0)
  })
})

describe('getScanHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('reports hasMore when there are more results past this page', async () => {
    mockPrisma.scanResult.findMany.mockResolvedValue([])
    mockPrisma.scanResult.count.mockResolvedValue(25)

    const result = await getScanHistory('user-1', { limit: 10, offset: 0 })

    expect(result.total).toBe(25)
    expect(result.hasMore).toBe(true)
  })

  it('reports no more results once the last page is reached', async () => {
    mockPrisma.scanResult.findMany.mockResolvedValue([])
    mockPrisma.scanResult.count.mockResolvedValue(25)

    const result = await getScanHistory('user-1', { limit: 10, offset: 20 })

    expect(result.hasMore).toBe(false)
  })
})
