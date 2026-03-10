'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function PricingPage() {
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const handleUpgrade = async () => {
    setCheckoutLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setCheckoutLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #f2f2fa; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .wordmark {
          font-family: 'Instrument Serif', serif;
          font-size: 20px; color: #f2f2fa; text-decoration: none;
          letter-spacing: -0.01em;
        }
        .wordmark em { color: #6366f1; font-style: italic; }

        .nav-link {
          font-size: 14px; color: #5a5a7a; text-decoration: none;
          transition: color 0.15s;
        }
        .nav-link:hover { color: #f2f2fa; }

        .faq-item {
          padding: 24px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .faq-item:first-child { border-top: 1px solid rgba(255,255,255,0.05); }

        @media (max-width: 720px) {
          .pricing-cards { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 16px !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
        background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Link href="/" className="wordmark" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" style={{ width: 20, height: 20, mixBlendMode: 'screen' }} />
          <span>Re<em>kawl</em></span>
        </Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/#features" className="nav-link">Features</Link>
          <Link href="/login" style={{
            padding: '7px 16px', borderRadius: 10,
            background: '#6366f1', color: '#fff',
            textDecoration: 'none', fontSize: 13, fontWeight: 500,
            boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
          }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        padding: '96px 32px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        background: '#0a0a0f',
      }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 65%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, animation: 'fadeUp 0.7s ease both' }}>
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: '#4a4a6a', letterSpacing: '0.18em', marginBottom: 20,
          }}>PRICING</p>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(44px, 7vw, 72px)',
            color: '#f2f2fa', fontWeight: 400, marginBottom: 16,
            letterSpacing: '-0.02em', lineHeight: 1.05,
          }}>
            simple, honest pricing
          </h1>
          <p style={{ fontSize: 16, color: '#4a4a6a', fontWeight: 300 }}>
            free to start. pay when you need more. cancel whenever.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '0 32px 96px', background: '#0a0a0f' }}>
        <div className="pricing-cards" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 20, maxWidth: 720, margin: '0 auto',
        }}>

          {/* Free */}
          <div style={{
            padding: '36px 32px', borderRadius: 20,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#3a3a5a', letterSpacing: '0.16em', marginBottom: 20 }}>FREE</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 56, color: '#f2f2fa', fontWeight: 400, lineHeight: 1 }}>$0</span>
              <span style={{ fontSize: 14, color: '#3a3a5a' }}>/month</span>
            </div>
            <p style={{ fontSize: 14, color: '#3a3a5a', marginBottom: 32, fontWeight: 300 }}>for getting started</p>

            {['10 saves per month', 'Pages, images, text', 'AI summaries + auto-tags', 'Full-text search', 'Chrome extension'].map(f => (
              <div key={f} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#6366f1', fontSize: 10, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: '#6060a0', fontWeight: 300 }}>{f}</span>
              </div>
            ))}

            <Link href="/login" style={{
              display: 'block', marginTop: 32, padding: '13px 0', textAlign: 'center',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
              color: '#f2f2fa', textDecoration: 'none',
              fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
            >Start for free</Link>
          </div>

          {/* Pro */}
          <div style={{
            padding: '36px 32px', borderRadius: 20, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(145deg, #0f0f20, #111128)',
            border: '1px solid rgba(99,102,241,0.28)',
            boxShadow: '0 0 48px rgba(99,102,241,0.08)',
          }}>
            <div style={{
              position: 'absolute', top: -50, right: -50, width: 160, height: 160,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)',
              pointerEvents: 'none', filter: 'blur(20px)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#8b8cf8', letterSpacing: '0.16em' }}>PRO</p>
                <span style={{
                  padding: '2px 8px', borderRadius: 100, fontSize: 9,
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                  color: '#8b8cf8', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em',
                }}>POPULAR</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 56, color: '#f2f2fa', fontWeight: 400, lineHeight: 1 }}>$5</span>
                <span style={{ fontSize: 14, color: '#5a5a7a' }}>/month</span>
              </div>
              <p style={{ fontSize: 14, color: '#4a4a6a', marginBottom: 32, fontWeight: 300 }}>for people who actually browse</p>

              {['Unlimited saves', 'Priority AI processing', 'Full search history', 'Everything in Free'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#8b5cf6', fontSize: 10, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>✦</span>
                  <span style={{ fontSize: 14, color: '#7070a0', fontWeight: 300 }}>{f}</span>
                </div>
              ))}

              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                style={{
                  display: 'block', width: '100%', marginTop: 32, padding: '13px 0',
                  textAlign: 'center', borderRadius: 12,
                  background: checkoutLoading ? 'rgba(99,102,241,0.5)' : '#6366f1',
                  color: '#fff', border: 'none', cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!checkoutLoading) (e.currentTarget as HTMLButtonElement).style.background = '#5254e7' }}
                onMouseLeave={e => { if (!checkoutLoading) (e.currentTarget as HTMLButtonElement).style.background = '#6366f1' }}
              >
                {checkoutLoading ? 'redirecting…' : 'Get Pro →'}
              </button>

              <p style={{
                textAlign: 'center', marginTop: 12, fontSize: 10,
                color: '#3a3a5a', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
              }}>
                CANCEL ANYTIME
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{
        background: '#050508',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '80px 32px',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 36, color: '#f2f2fa', fontWeight: 400,
            marginBottom: 48, textAlign: 'center',
          }}>
            questions
          </h2>

          {[
            { q: 'What counts as a save?', a: 'Every time you save a page, image, or text snippet = 1 save. Editing or deleting saves doesn\'t affect your count.' },
            { q: 'Can I upgrade in the middle of a month?', a: 'Yes. You get Pro instantly and your billing cycle starts from that day.' },
            { q: 'What happens when I hit the free limit?', a: 'You can\'t save new things until next month or until you upgrade. Everything already saved stays accessible.' },
            { q: 'How do I cancel?', a: 'One click in the billing portal on your dashboard. No dark patterns, no retention flows.' },
          ].map(({ q, a }) => (
            <div key={q} className="faq-item">
              <h3 style={{
                fontSize: 16, color: '#c0c0e0', fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", marginBottom: 10,
              }}>{q}</h3>
              <p style={{ fontSize: 14, color: '#4a4a6a', lineHeight: 1.7, fontWeight: 300 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '28px 32px', background: '#0a0a0f',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="footer-inner" style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Link href="/" className="wordmark" style={{ fontSize: 18, color: '#3a3a5a', display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" style={{ width: 18, height: 18, opacity: 0.35 }} />
            <span>Re<em style={{ color: '#4a4a7a' }}>kawl</em></span>
          </Link>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Home', '/'], ['Login', '/login']].map(([label, href]) => (
              <Link key={label} href={href} style={{
                fontSize: 12, color: '#2a2a4a', textDecoration: 'none',
                fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
                transition: 'color 0.15s',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#5a5a7a')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#2a2a4a')}
              >{label.toUpperCase()}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
