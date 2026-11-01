/**
 * Decrity Extension Popup
 */

import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import { STORAGE_KEYS, getPlatformFromUrl } from '@decrity/shared'

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
      <div className="popup">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="popup">
      <header className="header">
        <div className="logo">
          <div className="shield-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M12 2.5l7.5 3v6c0 5-3.2 8.3-7.5 10-4.3-1.7-7.5-5-7.5-10v-6l7.5-3z" />
            </svg>
          </div>
          <h1>Decrity</h1>
        </div>
        <div className="status">
          {inProtectionGap ? (
            <span className="status-badge gap">
              <span className="gap-mark">~</span>
              Catching up
            </span>
          ) : (
            <span className={`status-badge ${settings.protectionEnabled ? 'active' : 'inactive'}`}>
              {settings.protectionEnabled ? 'Protected' : 'Disabled'}
            </span>
          )}
        </div>
      </header>

      {inProtectionGap && (
        <div className="gap-banner">
          <span className="mark">~</span>
          <p>
            This site changed in a way we haven&rsquo;t caught up with yet. We&rsquo;re on it. Everything
            else stays protected.
            <button
              className="link"
              onClick={() => chrome.tabs.create({ url: 'https://decrity.app/help/protection-gap' })}
            >
              What happened?
            </button>
          </p>
        </div>
      )}

      <main className="content">
        <section className="settings">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Protection</h3>
              <p>Monitor AI interactions for threats</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.protectionEnabled}
                onChange={e => updateSetting('protectionEnabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Privacy Mode</h3>
              <p>Scan locally only, no data sent to cloud</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.privacyMode}
                onChange={e => updateSetting('privacyMode', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Notifications</h3>
              <p>Show alerts when threats are detected</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={e => updateSetting('notificationsEnabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        <section className="info">
          <div className="info-card">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12l5 5L20 6" />
              </svg>
            </div>
            <div className="info-text">
              <strong>Active Protection</strong>
              <p>Monitoring ChatGPT, Gemini, Claude, and Copilot</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <button className="link-button" onClick={() => chrome.tabs.create({ url: 'https://decrity.app' })}>
          View Dashboard
        </button>
      </footer>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
