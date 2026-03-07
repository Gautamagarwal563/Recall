'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both; }
        .d1 { animation-delay: 0.05s; } .d2 { animation-delay: 0.18s; }
        .d3 { animation-delay: 0.30s; } .d4 { animation-delay: 0.44s; }
        .d5 { animation-delay: 0.58s; } .d6 { animation-delay: 0.70s; }

        @keyframes glowPulse {
          0%,100% { opacity: 0.12; transform: scale(1); }
          50%      { opacity: 0.20; transform: scale(1.07); }
        }
        .glow-blob { animation: glowPulse 7s ease-in-out infinite; }

        .auth-input {
          width: 100%; padding: 13px 16px;
          background: #f0f0f9; border: 1.5px solid #e4e4f0;
          border-radius: 12px; color: #0a0a0f;
          font-family: 'DM Sans', sans-serif; font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .auth-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .auth-input::placeholder { color: #a0a0c0; }
        .auth-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 40px #f0f0f9 inset !important;
          -webkit-text-fill-color: #0a0a0f !important;
        }

        .submit-btn {
          width: 100%; padding: 14px;
          background: #6366f1; color: #fff; border: none;
          border-radius: 12px; font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          background: #4f46e5; transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(99,102,241,0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { background: #a5b4fc; cursor: not-allowed; box-shadow: none; }

        .tab-btn {
          flex: 1; padding: 10px; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer;
          transition: all 0.2s;
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex' }}>

        {/* ── Left Hero ── */}
        <div style={{
          width: '50%', flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px 56px',
          background: '#0a0a0f', position: 'relative', overflow: 'hidden',
          display: 'flex',
        }}>
          <div className="glow-blob" style={{
            position: 'absolute', top: '10%', left: '-10%',
            width: 520, height: 520, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,1) 0%, transparent 68%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '5%', right: '-5%',
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div className="fade-up d1" style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: '#3a3a5a', letterSpacing: '0.22em',
            position: 'relative', zIndex: 1,
          }}>
            RECALL &nbsp;·&nbsp; 2026
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="fade-up d2">
              <h1 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(72px, 8vw, 120px)',
                lineHeight: 0.88, letterSpacing: '-0.02em',
                color: '#f2f2fa', fontWeight: 400, marginBottom: 28,
              }}>
                Re<span style={{ color: '#6366f1', fontStyle: 'italic' }}>call</span>
              </h1>
            </div>

            <p className="fade-up d3" style={{
              fontSize: 18, color: '#6060a0', fontWeight: 300,
              lineHeight: 1.6, maxWidth: 340, marginBottom: 52,
            }}>
              Save anything.<br />
              <span style={{ color: '#9090c0' }}>Understand everything.</span>
            </p>

            <div className="fade-up d4" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {[
                { sym: '⊕', label: 'One-click save any page from Chrome' },
                { sym: '◈', label: 'AI summaries & auto-tags via Claude' },
                { sym: '◎', label: 'Full-text search across all your saves' },
              ].map(f => (
                <div key={f.sym} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 18,
                    color: '#6366f1', width: 24, flexShrink: 0, textAlign: 'center',
                  }}>{f.sym}</span>
                  <span style={{ fontSize: 14, color: '#7070a0', fontWeight: 300 }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up d6" style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: '#2a2a4a', letterSpacing: '0.18em',
            position: 'relative', zIndex: 1,
          }}>
            POWERED BY ANTHROPIC &nbsp;·&nbsp; FIRECRAWL
          </div>
        </div>

        {/* ── Right Auth ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '40px 24px',
          background: '#f4f4fb',
        }}>
          <div className="fade-up d2" style={{ width: '100%', maxWidth: 420 }}>
            <div style={{
              background: '#fff', borderRadius: 20, padding: '36px 32px',
              boxShadow: '0 2px 48px rgba(99,102,241,0.1), 0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid rgba(99,102,241,0.1)',
            }}>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 26, color: '#0a0a0f', fontWeight: 400,
                marginBottom: 6,
              }}>
                {tab === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p style={{ fontSize: 14, color: '#9090b0', marginBottom: 28, fontWeight: 300 }}>
                {tab === 'login' ? 'Sign in to access your saves' : 'Start saving and understanding the web'}
              </p>

              {/* Tabs */}
              <div style={{
                display: 'flex', gap: 4, background: '#f0f0f9',
                borderRadius: 14, padding: 4, marginBottom: 28,
              }}>
                {(['login', 'signup'] as const).map(t => (
                  <button
                    key={t}
                    className="tab-btn"
                    onClick={() => { setTab(t); setError('') }}
                    style={{
                      background: tab === t ? '#fff' : 'transparent',
                      color: tab === t ? '#0a0a0f' : '#9090b0',
                      fontWeight: tab === t ? 500 : 400,
                      boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {t === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{
                    display: 'block', marginBottom: 8,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11, color: '#8888aa', letterSpacing: '0.12em',
                  }}>EMAIL</label>
                  <input
                    className="auth-input" type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block', marginBottom: 8,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11, color: '#8888aa', letterSpacing: '0.12em',
                  }}>PASSWORD</label>
                  <input
                    className="auth-input" type="password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                  />
                </div>

                {error && (
                  <p style={{
                    fontSize: 13, color: '#ef4444',
                    background: 'rgba(239,68,68,0.06)',
                    padding: '8px 12px', borderRadius: 8,
                  }}>{error}</p>
                )}

                <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? 'Please wait…' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
