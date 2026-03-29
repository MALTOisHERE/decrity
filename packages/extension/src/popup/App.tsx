/**
 * TrustLayer Extension Popup
 */

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import { STORAGE_KEYS } from '@trustlayer/shared'

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

  useEffect(() => {
    loadSettings()
  }, [])

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
          <div className="shield-icon">🛡️</div>
          <h1>TrustLayer</h1>
        </div>
        <div className="status">
          <span className={`status-badge ${settings.protectionEnabled ? 'active' : 'inactive'}`}>
            {settings.protectionEnabled ? 'Protected' : 'Disabled'}
          </span>
        </div>
      </header>

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
            <div className="info-icon">✓</div>
            <div className="info-text">
              <strong>Active Protection</strong>
              <p>Monitoring ChatGPT, Gemini, Claude, and Copilot</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <button className="link-button" onClick={() => chrome.tabs.create({ url: 'https://trustlayer.app' })}>
          View Dashboard
        </button>
      </footer>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
