/**
 * History page - full threat history log
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useThreatHistory } from '@/lib/hooks'

const PAGE_SIZE = 20

export default function History() {
  const [page, setPage] = useState(0)
  const history = useThreatHistory({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every suspicious or threat scan Decrity has caught. Free tier shows the last 7 days.
        </p>
      </div>

      {history.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {history.isError && (
        <Card className="border-l-[3px] border-l-destructive shadow-none">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">Couldn't reach the connection to load your history.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check that the Decrity connection is running, then refresh this page.
            </p>
          </CardContent>
        </Card>
      )}

      {history.data && history.data.threats.length === 0 && page === 0 && (
        <Card className="shadow-none">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground max-w-md">
              No threats found. If Privacy Mode is on (the default), this is expected: scans stay on your
              device and never reach your account.
            </p>
          </CardContent>
        </Card>
      )}

      {history.data && history.data.threats.length > 0 && (
        <Card className="shadow-none">
          <CardContent className="pt-6">
            <ul className="divide-y">
              {history.data.threats.map(threat => (
                <li key={threat.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{threat.platform}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{threat.reason}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {new Date(threat.detectedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={threat.verdict === 'threat' ? 'destructive' : 'secondary'} className="shrink-0">
                    {threat.verdict}
                  </Badge>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-4 mt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}-{page * PAGE_SIZE + history.data.threats.length} of{' '}
                {history.data.total}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!history.data.hasMore}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
