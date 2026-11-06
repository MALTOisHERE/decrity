/**
 * Database service
 * Prisma client wrapper for data operations
 */

import { PrismaClient } from '@prisma/client'
import { ScanResponse, SupportedPlatform, ThreatDetail, hashContent } from '@decrity/shared'

const prisma = new PrismaClient()

/**
 * Persist scan result to database
 */
export async function persistScanResult(
  result: ScanResponse,
  platform: SupportedPlatform,
  userId?: string
): Promise<void> {
  await prisma.scanResult.create({
    data: {
      contentHash: crypto.randomUUID(), // Placeholder - should use actual hash
      verdict: result.verdict,
      score: result.score,
      reason: result.reason || '',
      detectionLayer: result.detectionLayer,
      platform,
      userId,
    },
  })
}

/**
 * Persist a Gap Report to the database
 */
export async function persistGapReport(
  platform: SupportedPlatform,
  reportedAt: number,
  extensionVersion: string
): Promise<void> {
  await prisma.gapReport.create({
    data: {
      platform,
      reportedAt: new Date(reportedAt),
      extensionVersion,
    },
  })
}

/**
 * Get scan history for a user
 */
export async function getScanHistory(
  userId: string | null,
  options: { limit: number; offset: number }
): Promise<{ threats: ThreatDetail[]; total: number; hasMore: boolean }> {
  const scans = await prisma.scanResult.findMany({
    where: {
      userId,
      verdict: { in: ['suspicious', 'threat'] },
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
    skip: options.offset,
  })

  const total = await prisma.scanResult.count({
    where: {
      userId,
      verdict: { in: ['suspicious', 'threat'] },
    },
  })

  const threats: ThreatDetail[] = scans.map(scan => ({
    id: scan.id,
    verdict: scan.verdict as 'suspicious' | 'threat',
    score: scan.score,
    reason: scan.reason || '',
    platform: scan.platform as SupportedPlatform,
    detectedAt: scan.createdAt.toISOString(),
    contentHash: scan.contentHash,
  }))

  return {
    threats,
    total,
    hasMore: options.offset + options.limit < total,
  }
}

/**
 * Get aggregate scan statistics for a user (dashboard stat cards + chart)
 */
export async function getUserStats(userId: string | null): Promise<{
  totalScans: number
  threatsDetected: number
  suspiciousDetected: number
  lastScanAt?: string
  currentStreak: number
  verdictBreakdown: { clean: number; suspicious: number; threat: number }
}> {
  const [totalScans, threatsDetected, suspiciousDetected, lastScan, scanDates] = await Promise.all([
    prisma.scanResult.count({ where: { userId } }),
    prisma.scanResult.count({ where: { userId, verdict: 'threat' } }),
    prisma.scanResult.count({ where: { userId, verdict: 'suspicious' } }),
    prisma.scanResult.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.scanResult.findMany({ where: { userId }, select: { createdAt: true } }),
  ])

  return {
    totalScans,
    threatsDetected,
    suspiciousDetected,
    lastScanAt: lastScan?.createdAt.toISOString(),
    currentStreak: computeStreak(scanDates.map(s => s.createdAt)),
    verdictBreakdown: {
      clean: totalScans - threatsDetected - suspiciousDetected,
      suspicious: suspiciousDetected,
      threat: threatsDetected,
    },
  }
}

/**
 * Consecutive days, ending today, with at least one scan recorded.
 */
function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  const scannedDays = new Set(dates.map(d => d.toISOString().slice(0, 10)))

  let streak = 0
  const cursor = new Date()
  cursor.setUTCHours(0, 0, 0, 0)

  while (scannedDays.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  return streak
}

export { prisma }
