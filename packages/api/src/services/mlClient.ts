/**
 * ML service HTTP client
 * Calls the Python FastAPI ML service
 */

import { ScanVerdict } from '@decrity/shared'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

interface MLResponse {
  verdict: ScanVerdict
  score: number
  reason: string
}

export async function callMLService(content: string): Promise<MLResponse> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`)
    }

    return (await response.json()) as MLResponse
  } catch (error) {
    console.error('ML service call failed:', error)
    throw error
  }
}
