'use client'

import Link from 'next/link'
import { useState } from 'react'

const FAQS = [
  {
    q: 'How do I save a web page?',
    a: 'Click the Rekawl icon in your Chrome toolbar while on any page. The page will be saved, summarized, and tagged automatically within a few seconds.',
  },
  {
    q: 'How do I save an image?',
    a: 'Right-click any image on the web and select "Save image to Rekawl" from the context menu.',
  },
  {
    q: 'How do I save a text snippet?',
    a: 'Highlight any text on a page, then right-click and select "Save selection to Rekawl".',
  },
  {
    q: 'I don\'t see the Rekawl icon in my toolbar.',
    a: 'Click the puzzle piece icon (Extensions) in Chrome\'s toolbar, find Rekawl in the list, and click the pin icon to pin it to your toolbar.',
  },
  {
    q: 'The extension says I\'m not signed in.',
    a: 'Click the extension icon to open the popup, then sign in with your Rekawl email and password. Your session is stored locally and won\'t expire unless you sign out.',
  },
  {
    q: 'What is the free plan limit?',
    a: 'The free plan includes 10 saves per calendar month. The count resets on the 1st of each month. Upgrade to Pro for unlimited saves.',
  },
  {
    q: 'How do I upgrade to Pro?',
    a: 'Go to your dashboard at rekawl.live/dashboard and click "Upgrade to Pro" in the sidebar. You\'ll be taken to a Stripe checkout page — it takes about 30 seconds.',
  },
  {
    q: 'How do I cancel my Pro subscription?',
    a: 'From your dashboard, click "Manage billing" in the sidebar. This opens the Stripe billing portal where you can cancel or modify your subscription at any time.',
  },
  {
    q: 'How do I delete a save?',
    a: 'Hover over any card in your dashboard and click the delete button (trash icon) that appears. Deletion is immediate and permanent.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Email hello@rekawl.live with the subject "Delete my account" from your registered email address. We\'ll delete everything within 7 days.',
  },
]

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; font-family: 'DM Sans', sans-serif; color: #e0e0f0; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#080810' }}>

        {/* Nav */}
        <nav style={{
          padding: '0 32px', height: 56, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(8,8,16,0.9)', backdropFilter: 'blur(14px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: "'Instrument Serif', serif", fontSize: 17,
            color: '#f0f0fa', textDecoration: 'none', letterSpacing: '-0.01em',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" style={{ width: 20, height: 20, mixBlendMode: 'screen' }} />
            <span>Re<em style={{ color: '#6366f1', fontStyle: 'italic' }}>kawl</em></span>
          </Link>
          <Link href="/privacy" style={{
            fontSize: 12, color: '#4a4a6a', textDecoration: 'none',
            fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#8080a0')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#4a4a6a')}
          >
            PRIVACY →
          </Link>
        </nav>

        <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 96px' }}>

          <p style={{
            fontSize: 10, color: '#3a3a5a', fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.16em', marginBottom: 20,
          }}>HELP · SUPPORT</p>

          <h1 style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 42,
            color: '#f2f2fa', fontWeight: 400, letterSpacing: '-0.02em',
            lineHeight: 1.1, marginBottom: 12,
          }}>
            How can we <em style={{ color: '#6366f1' }}>help?</em>
          </h1>
          <p style={{ fontSize: 15, color: '#4a4a6a', fontWeight: 300, marginBottom: 56 }}>
            Browse common questions below or email us directly.
          </p>

          {/* FAQ accordion */}
          <div style={{ marginBottom: 64 }}>
            <p style={{
              fontSize: 10, color: '#3a3a5a', fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.16em', marginBottom: 20,
            }}>FREQUENTLY ASKED</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 12,
                    background: open === i ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                    border: open === i ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden', transition: 'all 0.15s',
                  }}
                >
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: 16,
                      padding: '16px 20px', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#d0d0f0' }}>{faq.q}</span>
                    <span style={{
                      fontSize: 18, color: '#6366f1', flexShrink: 0,
                      transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
                      transition: 'transform 0.15s', lineHeight: 1,
                    }}>+</span>
                  </button>
                  {open === i && (
                    <div style={{ padding: '0 20px 18px' }}>
                      <p style={{ fontSize: 14, color: '#7070a0', lineHeight: 1.8 }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>


          {/* Contact card */}
          <div style={{
            padding: '32px 36px', borderRadius: 20,
            background: 'linear-gradient(145deg, #0f0f20, #13132a)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 0 60px rgba(99,102,241,0.06)',
          }}>
            <p style={{
              fontSize: 10, color: '#3a3a5a', fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.16em', marginBottom: 16,
            }}>STILL NEED HELP?</p>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 24,
              color: '#d0d0f0', fontWeight: 400, marginBottom: 8,
            }}>Email us directly</h2>
            <p style={{ fontSize: 14, color: '#4a4a6a', fontWeight: 300, marginBottom: 24, lineHeight: 1.7 }}>
              We respond to every email within 48 hours. Include your account email so we can look up your account quickly.
            </p>
            <a
              href="mailto:hello@rekawl.live"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', borderRadius: 11,
                background: '#6366f1', color: '#fff',
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#5254e7')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#6366f1')}
            >
              hello@rekawl.live
            </a>
          </div>

        </div>

        {/* Footer */}
        <footer style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 12, color: '#2a2a4a', textDecoration: 'none', fontFamily: "'DM Mono', monospace" }}>
            ← back to rekawl.live
          </Link>
        </footer>
      </div>
    </>
  )
}
