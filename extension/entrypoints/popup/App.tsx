import React, { useState, useEffect } from 'react'

const API_BASE = 'https://rekawl.live'

interface Save {
  id: string
  url: string
  title: string
  faviconUrl: string | null
  summary: string | null
  tags: string[]
  status: 'pending' | 'processed' | 'failed'
  isRead: boolean
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [saves, setSaves] = useState<Save[]>([])
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [currentTab, setCurrentTab] = useState<{ url: string; title: string } | null>(null)

  // Load stored token on mount
  useEffect(() => {
    chrome.storage.local.get(['rekawlToken'], result => {
      if (result.rekawlToken) setToken(result.rekawlToken)
    })
  }, [])

  // Get current tab info
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0]
      if (tab) setCurrentTab({ url: tab.url || '', title: tab.title || '' })
    })
  }, [])

  // Fetch recent saves when authenticated
  useEffect(() => {
    if (!token) return
    fetchRecentSaves()
  }, [token])

  const fetchRecentSaves = async () => {
    if (!token) return
    const res = await fetch(`${API_BASE}/api/saves`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 401) {
      chrome.storage.local.remove('rekawlToken')
      setToken(null)
      return
    }
    const data = await res.json()
    setSaves((data.saves ?? []).slice(0, 5))
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/signup'
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const d = await res.json()
    if (!res.ok) {
      setAuthError(d.error || 'Failed')
      setAuthLoading(false)
      return
    }

    // Token is returned directly in the login/signup response
    const t = d.token
    chrome.storage.local.set({ rekawlToken: t })
    setToken(t)
    setAuthLoading(false)
  }

  const handleSave = async () => {
    if (!currentTab || !token) return
    setSaving(true)
    setSaveSuccess(false)

    await fetch(`${API_BASE}/api/saves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: currentTab.url, title: currentTab.title }),
    })

    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
    fetchRecentSaves()
  }

  const handleLogout = () => {
    chrome.storage.local.remove('rekawlToken')
    setToken(null)
    setSaves([])
  }

  const s: React.CSSProperties = {}

  // ── Auth screen ──────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ padding: 20, background: '#0a0a0f', minHeight: 260 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
          * { box-sizing: border-box; }
          .p-input { width: 100%; padding: 9px 12px; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e0e0f0; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; }
          .p-input:focus { border-color: #6366f1; }
          .p-input::placeholder { color: #4a4a6a; }
          .p-btn { width: 100%; padding: 10px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
          .p-btn:hover:not(:disabled) { background: #4f46e5; }
          .p-btn:disabled { background: #a5b4fc; cursor: not-allowed; }
        `}</style>
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#f2f2fa' }}>
            Re<span style={{ color: '#6366f1', fontStyle: 'italic' }}>call</span>
          </span>
          <p style={{ fontSize: 11, color: '#5a5a7a', marginTop: 3, fontFamily: 'DM Mono' }}>SIGN IN TO SAVE PAGES</p>
        </div>

        <div style={{ display: 'flex', gap: 4, background: '#14141f', borderRadius: 8, padding: 3, marginBottom: 14 }}>
          {(['login', 'signup'] as const).map(t => (
            <button key={t} onClick={() => { setAuthTab(t); setAuthError('') }} style={{
              flex: 1, padding: '7px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              background: authTab === t ? '#1e1e32' : 'transparent',
              color: authTab === t ? '#e0e0f0' : '#5a5a7a',
              fontWeight: authTab === t ? 500 : 400,
            }}>{t === 'login' ? 'Sign In' : 'Sign Up'}</button>
          ))}
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="p-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="p-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {authError && <p style={{ fontSize: 11, color: '#ef4444' }}>{authError}</p>}
          <button className="p-btn" type="submit" disabled={authLoading}>
            {authLoading ? 'Please wait…' : authTab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    )
  }

  // ── Main screen ──────────────────────────────────────────────
  return (
    <div style={{ background: '#0a0a0f', minHeight: 300, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
        * { box-sizing: border-box; }
        @keyframes pp { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .pp { animation: pp 1.4s ease-in-out infinite; }
        .save-item:hover { background: #1e1e32 !important; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: '#f2f2fa' }}>
          Re<span style={{ color: '#6366f1', fontStyle: 'italic' }}>call</span>
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={`${API_BASE}/dashboard`} target="_blank" rel="noreferrer"
            style={{
              fontSize: 10, fontFamily: 'DM Mono', color: '#5a5a7a',
              textDecoration: 'none', letterSpacing: '0.08em',
              padding: '4px 8px', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6, transition: 'color 0.15s',
            }}
          >DASHBOARD ↗</a>
          <button onClick={handleLogout} style={{
            background: 'none', border: 'none', color: '#3a3a5a',
            fontSize: 16, cursor: 'pointer', padding: '2px 4px',
          }} title="Logout">⊗</button>
        </div>
      </div>

      {/* Save button */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {currentTab && (
          <div style={{ marginBottom: 10 }}>
            <p style={{
              fontSize: 12, color: '#e0e0f0', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              marginBottom: 2,
            }}>{currentTab.title || currentTab.url}</p>
            <p style={{
              fontSize: 10, color: '#3a3a5a', fontFamily: 'DM Mono',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{currentTab.url}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || saveSuccess}
          style={{
            width: '100%', padding: '10px',
            background: saveSuccess ? 'rgba(34,197,94,0.15)' : saving ? '#2a2a3f' : '#6366f1',
            color: saveSuccess ? '#22c55e' : saving ? '#6060a0' : '#fff',
            border: saveSuccess ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
            borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, fontWeight: 500, cursor: saving || saveSuccess ? 'default' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {saveSuccess ? '✓ Saved — AI processing…' : saving ? 'Saving…' : '⊕  Save this page'}
        </button>
      </div>

      {/* Recent saves */}
      {saves.length > 0 && (
        <div style={{ flex: 1, padding: '10px 0' }}>
          <p style={{
            fontSize: 10, color: '#3a3a5a', fontFamily: 'DM Mono',
            letterSpacing: '0.1em', padding: '0 16px', marginBottom: 6,
          }}>RECENT SAVES</p>
          {saves.map(save => (
            <a
              key={save.id}
              href={save.url} target="_blank" rel="noreferrer"
              className="save-item"
              style={{
                display: 'block', padding: '8px 16px',
                textDecoration: 'none', transition: 'background 0.15s',
                background: 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {save.faviconUrl && (
                  <img src={save.faviconUrl} alt="" width={14} height={14}
                    style={{ borderRadius: 3, flexShrink: 0 }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
                <span style={{
                  fontSize: 12, color: '#c0c0e0', flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{save.title || save.url}</span>
                {save.status === 'pending' && (
                  <div className="pp" style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#6366f1', flexShrink: 0,
                  }} />
                )}
              </div>
              {save.summary && (
                <p style={{
                  fontSize: 11, color: '#4a4a7a', marginTop: 3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  paddingLeft: 22,
                }}>{save.summary}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
