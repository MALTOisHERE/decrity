/**
 * IndexedDB cache manager for scan results
 * Stores results by content hash to avoid redundant scans
 */

import { ScanResponse, CachedScanResult, CACHE_CONFIG, hashContent } from '@decrity/shared'

const DB_NAME = 'DecrityCache'
const DB_VERSION = 1
const STORE_NAME = 'scans'

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'contentHash' })
        store.createIndex('expiresAt', 'expiresAt', { unique: false })
      }
    }
  })
}

/**
 * Get cached scan result by content
 */
export async function getCachedScan(content: string): Promise<ScanResponse | null> {
  try {
    const contentHash = await hashContent(content)
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(contentHash)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const cached = request.result as CachedScanResult | undefined

        if (!cached) {
          resolve(null)
          return
        }

        // Check if expired
        if (Date.now() > cached.expiresAt) {
          // Delete expired entry
          deleteCachedScan(contentHash)
          resolve(null)
          return
        }

        resolve({
          verdict: cached.verdict,
          score: cached.score,
          reason: cached.reason,
          detectionLayer: cached.detectionLayer,
          scanId: cached.scanId,
          timestamp: cached.timestamp,
        })
      }
    })
  } catch (error) {
    console.error('Cache get failed:', error)
    return null
  }
}

/**
 * Cache scan result
 */
export async function cacheScanResult(
  content: string,
  result: ScanResponse
): Promise<void> {
  try {
    const contentHash = await hashContent(content)
    const db = await openDB()

    const cached: CachedScanResult = {
      ...result,
      contentHash,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_CONFIG.SCAN_RESULT_TTL,
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(cached)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.error('Cache put failed:', error)
  }
}

/**
 * Delete cached scan by hash
 */
async function deleteCachedScan(contentHash: string): Promise<void> {
  try {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(contentHash)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.error('Cache delete failed:', error)
  }
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('expiresAt')

      const now = Date.now()
      const range = IDBKeyRange.upperBound(now)
      const request = index.openCursor(range)

      request.onerror = () => reject(request.error)
      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  } catch (error) {
    console.error('Cache cleanup failed:', error)
  }
}

// Run cleanup periodically
setInterval(clearExpiredCache, CACHE_CONFIG.CLEANUP_INTERVAL)
