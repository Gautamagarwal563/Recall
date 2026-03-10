'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
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

    router.push(tab === 'signup' ? '/onboarding' : '/dashboard')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%,100% { transform: translateX(-50%) scale(1); }
          50%      { transform: translateX(-50%) scale(1.06); }
        }

        .auth-input {
          width: 100%; padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px; color: #e8e8f8;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 300;
          transition: border-color 0.2s, box-shadow 0.2s; outline: none;
        }
        .auth-input:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .auth-input::placeholder { color: #2a2a4a; }
        .auth-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 40px #16161f inset !important;
          -webkit-text-fill-color: #e8e8f8 !important;
        }

        .tab-btn {
          flex: 1; padding: 9px; border: none; border-radius: 9px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn {
          width: 100%; padding: 14px;
          background: #6366f1; color: #fff; border: none;
          border-radius: 12px; font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
          transition: background 0.15s, transform 0.15s;
        }
        .submit-btn:hover:not(:disabled) {
          background: #5254e7; transform: translateY(-1px);
        }
        .submit-btn:disabled { background: rgba(99,102,241,0.4); cursor: not-allowed; box-shadow: none; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', width: 500, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 65%)',
          top: '5%', left: '50%', transform: 'translateX(-50%)',
          animation: 'blob 10s ease-in-out infinite',
          pointerEvents: 'none', filter: 'blur(60px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>

          {/* Back link */}
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32,
            fontSize: 12, color: '#3a3a5a', textDecoration: 'none',
            fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
            transition: 'color 0.15s', animation: 'fadeUp 0.6s ease both',
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#8080a0')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#3a3a5a')}
          >
            ← REKAWL
          </Link>

          <div style={{
            background: '#12121c', borderRadius: 20,
            padding: '36px 32px',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            animation: 'fadeUp 0.6s 0.05s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 28, color: '#f2f2fa', fontWeight: 400, marginBottom: 4,
            }}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{
              fontSize: 14, color: '#4a4a6a', marginBottom: 28,
              fontWeight: 300,
            }}>
              {tab === 'login' ? 'good to see you again' : 'free to start, no card needed'}
            </p>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 13, padding: 4, marginBottom: 28,
            }}>
              {(['login', 'signup'] as const).map(t => (
                <button key={t} className="tab-btn"
                  onClick={() => { setTab(t); setError('') }}
                  style={{
                    background: tab === t ? 'rgba(99,102,241,0.18)' : 'transparent',
                    color: tab === t ? '#a5b4fc' : '#3a3a5a',
                    fontWeight: tab === t ? 500 : 400,
                    border: tab === t ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                  }}
                >
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{
                  display: 'block', marginBottom: 8,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10, color: '#3a3a5a', letterSpacing: '0.14em',
                }}>EMAIL</label>
                <input className="auth-input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required />
              </div>

              <div>
                <label style={{
                  display: 'block', marginBottom: 8,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10, color: '#3a3a5a', letterSpacing: '0.14em',
                }}>PASSWORD</label>
                <input className="auth-input" type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required />
              </div>

              {error && (
                <p style={{
                  fontSize: 13, color: '#f87171',
                  background: 'rgba(248,113,113,0.06)',
                  border: '1px solid rgba(248,113,113,0.12)',
                  padding: '10px 14px', borderRadius: 10,
                  fontFamily: "'DM Mono', monospace", letterSpacing: '0.02em',
                }}>{error}</p>
              )}

              <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'one sec…' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>

            <p style={{
              textAlign: 'center', marginTop: 20, fontSize: 10,
              color: '#2a2a4a', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em',
            }}>
              FREE FOREVER · NO CREDIT CARD
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
