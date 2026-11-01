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
  userId: string,
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

export { prisma }
