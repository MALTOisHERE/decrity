/**
 * History page - Threat history log
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function History() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Threat History</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent threats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your threat detection history will appear here.</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Note: Free tier shows last 7 days only
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
