import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { ScanResponse } from '@decrity/shared'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BannerProps {
  result: ScanResponse
  onDismiss: () => void
}

export function Banner({ result, onDismiss }: BannerProps) {
  const [showDetails, setShowDetails] = useState(false)
  const isThreat = result.verdict === 'threat'

  const checkedBy =
    result.detectionLayer === 'ml'
      ? 'cloud detection'
      : result.detectionLayer === 'both'
        ? 'on-device and cloud detection'
        : 'on-device detection'

  return (
    <div className="decrity-banner-root my-3">
      <Alert variant={isThreat ? 'destructive' : 'warning'}>
        <TriangleAlert className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold mb-0.5">
            {isThreat ? 'Content flagged as a threat' : 'Potentially suspicious content'}
          </div>
          <div>{result.reason}</div>

          {showDetails && (
            <div className="mt-2 pt-2 border-t border-current/20 text-xs opacity-80">
              Confidence: {Math.round(result.score * 100)}%
              <br />
              Checked by: {checkedBy}
            </div>
          )}

          <div className="flex gap-4 mt-2.5">
            <button
              type="button"
              className="text-xs font-semibold underline underline-offset-2"
              onClick={() => setShowDetails(v => !v)}
            >
              {showDetails ? 'Hide details' : 'See details'}
            </button>
            <button
              type="button"
              className="text-xs font-medium underline underline-offset-2 opacity-75"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
