/**
 * Dashboard page - at-a-glance protection status
 */

import { ShieldCheck, TriangleAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserStats, useThreatHistory } from '@/lib/hooks'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const stats = useUserStats()
  const recentActivity = useThreatHistory({ limit: 6, offset: 0 })

  if (stats.isLoading) {
    return <p className="text-muted-foreground">Loading your stats...</p>
  }

  if (stats.isError) {
    return (
      <Card className="border-l-[3px] border-l-destructive shadow-none">
        <CardContent className="pt-6">
          <p className="text-destructive font-medium">Couldn't reach the connection to load your stats.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check that the Decrity connection is running, then refresh this page.
          </p>
        </CardContent>
      </Card>
    )
  }

  const data = stats.data!

  if (data.totalScans === 0) {
    return (
      <Card className="border-l-[3px] border-l-primary shadow-none">
        <CardContent className="pt-6">
          <p className="font-medium text-foreground">No activity yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Decrity hasn't sent any scans to your account yet. If Privacy Mode is on (the default), this is
            expected: everything stays on your device and never reaches your account. Turn off Privacy Mode in
            the extension popup if you'd like your history to show up here.
          </p>
        </CardContent>
      </Card>
    )
  }

  const hero = getHeroState(data)

  return (
    <div className="flex flex-col gap-8">
      <Card className={cn('border-l-[3px] shadow-none', hero.borderClass)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2.5">
            <hero.icon className={cn('w-6 h-6', hero.iconClass)} strokeWidth={1.8} />
            <span className="text-3xl font-semibold text-foreground">{hero.headline}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">{hero.detail}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-none">
          <CardContent className="pt-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Recent activity</h2>
            {recentActivity.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {recentActivity.isError && (
              <p className="text-sm text-muted-foreground">Couldn't load recent activity right now.</p>
            )}
            {recentActivity.data && recentActivity.data.threats.length === 0 && (
              <p className="text-sm text-muted-foreground">No suspicious or threat activity detected.</p>
            )}
            {recentActivity.data && recentActivity.data.threats.length > 0 && (
              <ul className="divide-y">
                {recentActivity.data.threats.map(threat => (
                  <li key={threat.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{threat.platform}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{threat.reason}</p>
                    </div>
                    <Badge variant={threat.verdict === 'threat' ? 'destructive' : 'secondary'} className="shrink-0">
                      {threat.verdict}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="pt-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Scan breakdown</h2>
            <VerdictBars breakdown={data.verdictBreakdown} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getHeroState(data: {
  totalScans: number
  threatsDetected: number
  suspiciousDetected: number
}) {
  if (data.threatsDetected > 0) {
    return {
      headline: `${data.threatsDetected} ${data.threatsDetected === 1 ? 'threat' : 'threats'} caught`,
      detail: `Out of ${data.totalScans} scans checked.`,
      icon: TriangleAlert,
      iconClass: 'text-destructive',
      borderClass: 'border-l-destructive',
    }
  }
  if (data.suspiciousDetected > 0) {
    return {
      headline: `${data.suspiciousDetected} ${data.suspiciousDetected === 1 ? 'item' : 'items'} flagged`,
      detail: `Out of ${data.totalScans} scans checked. Nothing confirmed as a threat.`,
      icon: TriangleAlert,
      iconClass: 'text-amber-500',
      borderClass: 'border-l-amber-500',
    }
  }
  return {
    headline: "You're protected",
    detail: `${data.totalScans} scans checked, nothing found.`,
    icon: ShieldCheck,
    iconClass: 'text-green-600',
    borderClass: 'border-l-green-600',
  }
}

function VerdictBars({ breakdown }: { breakdown: { clean: number; suspicious: number; threat: number } }) {
  const rows = [
    { label: 'Clean', count: breakdown.clean, barClass: 'bg-green-600' },
    { label: 'Suspicious', count: breakdown.suspicious, barClass: 'bg-amber-500' },
    { label: 'Threat', count: breakdown.threat, barClass: 'bg-destructive' },
  ]
  const max = Math.max(1, ...rows.map(r => r.count))

  return (
    <div className="flex flex-col gap-3">
      {rows.map(row => (
        <div key={row.label}>
          <div className="flex items-baseline justify-between text-xs mb-1">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="text-foreground font-medium">{row.count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full', row.barClass)}
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
