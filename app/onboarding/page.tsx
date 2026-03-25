'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

const BROWSERS = [
  { name: 'Firefox', icon: '🦊', soon: true },
  { name: 'Safari', icon: '🧭', soon: true },
  { name: 'Edge', icon: '🌊', soon: true },
  { name: 'Arc', icon: '⌘', soon: true },
]

const STEPS = [
  {
    num: '01',
    title: 'Install the extension',
    desc: 'Click "Add to Chrome" and confirm the install. Takes 10 seconds.',
  },
  {
    num: '02',
    title: 'Pin it to your toolbar',
    desc: 'Click the puzzle icon → find Rekawl → click the pin. Now it\'s always one click away.',
  },
  {
    num: '03',
    title: 'Save your first thing',
    desc: 'Click the extension icon on any page to save it. Or right-click any image to save that instead.',
  },
]

export default function OnboardingPage() {
  const [copied, setCopied] = useState(false)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; font-family: 'DM Sans', sans-serif; color: #e0e0f0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#080810', position: 'relative', overflow: 'hidden' }}>

        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 65%)',
          filter: 'blur(60px)', pointerEvents: 'none',
          animation: 'glow 6s ease-in-out infinite',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', padding: '64px 24px 96px' }}>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 56, textAlign: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" style={{ width: 24, height: 24, mixBlendMode: 'screen' }} />
              <span style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 22, color: '#f0f0fa', letterSpacing: '-0.01em',
              }}>Re<em style={{ color: '#6366f1', fontStyle: 'italic' }}>kawl</em></span>
            </div>
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', borderRadius: 100, marginBottom: 24,
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: 11, color: '#4ade80', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>
                ACCOUNT CREATED
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(40px, 7vw, 62px)',
              color: '#f2f2fa', fontWeight: 400,
              letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 16,
            }}>
              you&apos;re in.<br />
              <em style={{ color: '#6366f1' }}>now install the extension.</em>
            </h1>
            <p style={{ fontSize: 16, color: '#4a4a6a', fontWeight: 300, maxWidth: 400, margin: '0 auto' }}>
              The extension is how you save things. Install it first — takes 30 seconds.
            </p>
          </motion.div>

          {/* Chrome install CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: 48 }}
          >
            <div style={{
              background: 'linear-gradient(145deg, #0f0f20, #13132a)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 20,
              padding: '32px 36px',
              boxShadow: '0 0 60px rgba(99,102,241,0.08)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -40, right: -40, width: 160, height: 160,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)',
                filter: 'blur(20px)', pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>🌐</div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 500, color: '#e0e0f0', marginBottom: 2 }}>
                      Rekawl for Chrome
                    </p>
                    <p style={{ fontSize: 12, color: '#4a4a6a', fontFamily: "'DM Mono', monospace" }}>
                      Chrome Web Store · Free
                    </p>
                  </div>
                </div>

                <a
                  href="https://chromewebstore.google.com/detail/rekawl/ifebiknliaoebdhnofocogmimjeldfbk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '14px 0', borderRadius: 13,
                    background: '#6366f1', color: '#fff',
                    textDecoration: 'none', fontSize: 15, fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                    transition: 'background 0.15s, transform 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = '#5254e7'
                    ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = '#6366f1'
                    ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                    <circle cx="9" cy="9" r="3.5" fill="white"/>
                    <path d="M9 5.5L14 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 5.5L6.5 9.8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M14 5.5L11.5 9.8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Add to Chrome — it&apos;s free
                </a>
              </div>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginBottom: 48 }}
          >
            <p style={{
              fontSize: 10, color: '#3a3a5a', fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.16em', marginBottom: 20, textAlign: 'center',
            }}>THREE STEPS · 30 SECONDS</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: 'flex', gap: 16, alignItems: 'flex-start',
                    padding: '18px 20px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 11,
                    color: '#6366f1', flexShrink: 0, marginTop: 2,
                  }}>{step.num}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#d0d0f0', marginBottom: 4 }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: 13, color: '#4a4a6a', fontWeight: 300, lineHeight: 1.6 }}>
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* More browsers coming soon */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ marginBottom: 48 }}
          >
            <div style={{
              padding: '24px 28px', borderRadius: 16,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <p style={{
                fontSize: 10, color: '#3a3a5a', fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.16em', marginBottom: 16,
              }}>MORE BROWSERS COMING SOON</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {BROWSERS.map(b => (
                  <div key={b.name} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{ fontSize: 16 }}>{b.icon}</span>
                    <span style={{ fontSize: 13, color: '#5a5a7a' }}>{b.name}</span>
                    <span style={{
                      fontSize: 8, color: '#4a4a6a',
                      fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em',
                      padding: '2px 6px', borderRadius: 4,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}>SOON</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Skip to dashboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{ textAlign: 'center' }}
          >
            <Link href="/dashboard" style={{
              fontSize: 13, color: '#3a3a5a',
              fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
              textDecoration: 'none', transition: 'color 0.15s',
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#8080a0')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#3a3a5a')}
            >
              skip → go to dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  )
}
