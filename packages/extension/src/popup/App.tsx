/**
 * Decrity Extension Popup
 */

import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import { STORAGE_KEYS, getPlatformFromUrl } from '@decrity/shared'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Settings {
  protectionEnabled: boolean
  privacyMode: boolean
  notificationsEnabled: boolean
}

function App() {
  const [settings, setSettings] = useState<Settings>({
    protectionEnabled: true,
    privacyMode: true,
    notificationsEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [inProtectionGap, setInProtectionGap] = useState(false)

  useEffect(() => {
    loadSettings()
    loadProtectionGapState()
  }, [])

  const loadProtectionGapState = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const platform = tab?.url ? getPlatformFromUrl(tab.url) : null

      const response = await chrome.runtime.sendMessage({
        type: 'GET_PROTECTION_GAP_STATE',
        payload: { platform },
      })
      setInProtectionGap(Boolean(response?.inGap))
    } catch (error) {
      console.error('Failed to load protection gap state:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get([STORAGE_KEYS.SETTINGS])
      if (result[STORAGE_KEYS.SETTINGS]) {
        setSettings(result[STORAGE_KEYS.SETTINGS])
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: keyof Settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    try {
      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: newSettings,
      })
    } catch (error) {
      console.error('Failed to save setting:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-80 bg-background py-10 text-center text-sm text-muted-foreground">Loading...</div>
    )
  }

  return (
    <div className="w-80 bg-background">
      <header className="flex items-center justify-between px-4 py-4 border-b">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 text-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M12 2.5l7.5 3v6c0 5-3.2 8.3-7.5 10-4.3-1.7-7.5-5-7.5-10v-6l7.5-3z" />
            </svg>
          </span>
          <h1 className="text-[18px] font-semibold text-foreground">Decrity</h1>
        </div>
        <div>
          {inProtectionGap ? (
            <Badge variant="outline" className="bg-accent text-accent-foreground gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold inline-flex items-center justify-center">
                ~
              </span>
              Catching up
            </Badge>
          ) : (
            <Badge variant={settings.protectionEnabled ? 'success' : 'outline'}>
              {settings.protectionEnabled ? 'Protected' : 'Disabled'}
            </Badge>
          )}
        </div>
      </header>

      {inProtectionGap && (
        <div className="px-4 pt-3">
          <Alert variant="info">
            <AlertDescription>
              This site changed in a way we haven&rsquo;t caught up with yet. We&rsquo;re on it. Everything
              else stays protected.{' '}
              <button
                className="font-semibold underline underline-offset-2"
                onClick={() => chrome.tabs.create({ url: 'https://decrity.app/help/protection-gap' })}
              >
                What happened?
              </button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <main className="px-4 py-4">
        <section className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-0.5">Protection</h3>
              <p className="text-xs text-muted-foreground">Monitor AI interactions for threats</p>
            </div>
            <Switch
              checked={settings.protectionEnabled}
              onCheckedChange={checked => updateSetting('protectionEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-0.5">Privacy Mode</h3>
              <p className="text-xs text-muted-foreground">Scan locally only, no data sent to cloud</p>
            </div>
            <Switch
              checked={settings.privacyMode}
              onCheckedChange={checked => updateSetting('privacyMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-0.5">Notifications</h3>
              <p className="text-xs text-muted-foreground">Show alerts when threats are detected</p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={checked => updateSetting('notificationsEnabled', checked)}
            />
          </div>
        </section>

        <Card className="bg-muted border-none shadow-none">
          <CardContent className="p-3 flex gap-3">
            <span className="w-[18px] h-[18px] text-green-600 flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12l5 5L20 6" />
              </svg>
            </span>
            <div>
              <strong className="block text-[13px] font-medium text-foreground mb-0.5">Active Protection</strong>
              <p className="text-xs text-muted-foreground">Monitoring ChatGPT, Gemini, Claude, and Copilot</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="px-4 py-3 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => chrome.tabs.create({ url: 'https://decrity.app' })}
        >
          View Dashboard
        </Button>
      </footer>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
