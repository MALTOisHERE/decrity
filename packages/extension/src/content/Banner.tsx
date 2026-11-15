import { useState } from 'react'
import { Eye, EyeOff, X, TriangleAlert } from 'lucide-react'
import { ScanResponse } from '@decrity/shared'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface BannerProps {
  result: ScanResponse
  onDismiss: () => void
}

/**
 * Both buttons and the details card draw their color from the same
 * severity family as the banner itself (amber for suspicious, red for
 * threat), not the extension's own brand teal. shadcn's default
 * outline/ghost hover state uses `--accent`, a light brand-teal tint,
 * which would otherwise flash brand color inside a content-danger banner —
 * exactly the clash DESIGN_SYSTEM.md's "tool-health teal vs. content-danger
 * amber/red" rule warns against.
 */
const PALETTES = {
  suspicious: {
    details: 'border-amber-300 bg-amber-100/60 text-amber-900 hover:bg-amber-200/70 hover:text-amber-900',
    dismiss: 'text-amber-800/80 hover:bg-amber-200/50 hover:text-amber-900',
    detailsCard: 'border-amber-300/70 text-amber-900',
    track: 'bg-amber-900/15',
    fill: 'bg-amber-700',
  },
  threat: {
    details: 'border-red-300 bg-red-100/60 text-red-900 hover:bg-red-200/70 hover:text-red-900',
    dismiss: 'text-red-800/80 hover:bg-red-200/50 hover:text-red-900',
    detailsCard: 'border-red-300/70 text-red-900',
    track: 'bg-red-900/15',
    fill: 'bg-red-700',
  },
} as const

export function Banner({ result, onDismiss }: BannerProps) {
  const [showDetails, setShowDetails] = useState(false)
  const isThreat = result.verdict === 'threat'
  const palette = isThreat ? PALETTES.threat : PALETTES.suspicious

  // The reason string is "<plain-language explanation>: <the exact text that
  // triggered it>" (see heuristics.ts's generateReason()). Splitting it out
  // lets the flagged snippet render as its own highlighted block instead of
  // blending into the sentence around it — otherwise the one phrase that
  // actually got this flagged (e.g. "send any credentials or password to")
  // reads just like the rest of an ordinary-looking message.
  const reason = result.reason ?? ''
  const colonIndex = reason.indexOf(': ')
  const reasonLead = colonIndex === -1 ? reason : reason.slice(0, colonIndex)
  const flaggedText = colonIndex === -1 ? null : reason.slice(colonIndex + 2)

  const checkedBy =
    result.detectionLayer === 'ml'
      ? 'cloud detection'
      : result.detectionLayer === 'both'
        ? 'on-device and cloud detection'
        : 'on-device detection'

  const confidence = Math.round(result.score * 100)

  return (
    <div className="decrity-banner-root my-3">
      <Alert variant={isThreat ? 'destructive' : 'warning'}>
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="font-semibold">
            {isThreat ? 'Content flagged as a threat' : 'Potentially suspicious content'}
          </span>
        </div>
        <AlertDescription className="mt-1">
          <div>{reasonLead}</div>

          {flaggedText && (
            <div className={`mt-2 rounded-md border px-2.5 py-1.5 text-xs ${palette.detailsCard}`}>
              <div className="font-medium opacity-70">Flagged text</div>
              <div className="mt-0.5 break-words font-mono">&ldquo;{flaggedText}&rdquo;</div>
            </div>
          )}

          {showDetails && (
            <div className={`mt-2.5 rounded-md border bg-background/40 px-2.5 py-2 text-xs ${palette.detailsCard}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-medium opacity-70">Confidence</span>
                <span className="font-semibold tabular-nums">{confidence}%</span>
              </div>
              <div className={`h-1 mt-1 rounded-full overflow-hidden ${palette.track}`}>
                <div className={`h-full rounded-full ${palette.fill}`} style={{ width: `${confidence}%` }} />
              </div>
              <div className="mt-1.5 opacity-70">Checked by {checkedBy}</div>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`h-7 rounded-full gap-1.5 shadow-none ${palette.details}`}
              onClick={() => setShowDetails(v => !v)}
            >
              {showDetails ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showDetails ? 'Hide' : 'Details'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 rounded-full gap-1.5 ${palette.dismiss}`}
              onClick={onDismiss}
            >
              <X className="h-3.5 w-3.5" />
              Dismiss
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
