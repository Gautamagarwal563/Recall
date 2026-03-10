'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'

// ─── Scroll animation wrapper ─────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_ARTICLES = [
  {
    title: "The Founder's Guide to Product-Market Fit",
    domain: 'techcrunch.com',
    favicon: 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=32',
    summary: "PMF is about retention, not acquisition. Key signals: organic growth, high NPS, and users who'd be 'very disappointed' without the product. Most founders chase acquisition metrics instead.",
    tags: ['startup', 'product', 'pmf'],
    timeAgo: 'just now',
  },
  {
    title: 'Deep Work: The Skill That Defines the Future',
    domain: 'calnewport.com',
    favicon: 'https://www.google.com/s2/favicons?domain=calnewport.com&sz=32',
    summary: "The ability to perform focused, uninterrupted cognitive work is becoming rare and extraordinarily valuable. Newport argues it's the defining skill of the knowledge economy — and most people are actively losing it.",
    tags: ['productivity', 'focus', 'work'],
    timeAgo: '3h ago',
  },
  {
    title: 'How Stripe Thinks About API Design',
    domain: 'stripe.com',
    favicon: 'https://www.google.com/s2/favicons?domain=stripe.com&sz=32',
    summary: "Stripe's API philosophy: make the common case simple and the complex case possible. Every endpoint is designed around developer intent, not internal data models. Consistency across errors, pagination, and naming is non-negotiable.",
    tags: ['api', 'design', 'developer-experience'],
    timeAgo: '1d ago',
  },
]

const STATIC_CARDS = [
  {
    title: 'The Science of Building Habits That Stick',
    domain: 'jamesclear.com',
    favicon: 'https://www.google.com/s2/favicons?domain=jamesclear.com&sz=32',
    summary: "Habit formation follows a cue-routine-reward loop. The most effective habits are anchored to existing behaviors and made immediately rewarding — even fractionally.",
    tags: ['habits', 'psychology'],
    timeAgo: '2d ago',
    isRead: true,
  },
  {
    title: 'Why Most Startups Get Pricing Wrong',
    domain: 'a16z.com',
    favicon: 'https://www.google.com/s2/favicons?domain=a16z.com&sz=32',
    summary: "Startups undercharge because they anchor price to cost rather than value. The right pricing conversation asks what outcome the customer is buying, not what it costs to deliver.",
    tags: ['pricing', 'startups', 'b2b'],
    timeAgo: '4d ago',
    isRead: false,
  },
]

// ─── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, speed: number, active: boolean) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); return }
    setDisplayed(''); setDone(false)
    let i = 0
    const t = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, ++i)) }
      else { setDone(true); clearInterval(t) }
    }, speed)
    return () => clearInterval(t)
  }, [text, speed, active])
  return { displayed, done }
}

// ─── The main auto demo component ─────────────────────────────────────────────
function AutoDemo() {
  const [articleIdx, setArticleIdx] = useState(0)
  const [phase, setPhase] = useState(0)
  // phases: 0=card appears pending, 1=typing summary, 2=tags appear, 3=rest
  const article = DEMO_ARTICLES[articleIdx]
  const { displayed: summary, done: summaryDone } = useTypewriter(article.summary, 16, phase >= 1)

  useEffect(() => {
    const timings = [800, 3800, 600, 2200]
    const t = setTimeout(() => {
      if (phase < 3) {
        setPhase(p => p + 1)
      } else {
        setPhase(0)
        setArticleIdx(i => (i + 1) % DEMO_ARTICLES.length)
      }
    }, timings[phase])
    return () => clearTimeout(t)
  }, [phase])

  return (
    <div style={{
      borderRadius: 14,
      background: '#0e0e18',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08)',
    }}>
      {/* Browser chrome */}
      <div style={{
        height: 44, background: '#111119',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
        </div>
        <div style={{
          flex: 1, maxWidth: 320, margin: '0 auto', height: 26,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 6, display: 'flex', alignItems: 'center',
          padding: '0 10px', gap: 6,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840', opacity: 0.5, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#3a3a5a', fontFamily: "'DM Mono', monospace" }}>
            rekawl.live/dashboard
          </span>
        </div>
      </div>

      {/* App navbar */}
      <div style={{
        height: 52, borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14,
        background: 'rgba(10,10,20,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" style={{ width: 22, height: 22, mixBlendMode: 'screen' }} />
          <span style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 17, color: '#f0f0fa', letterSpacing: '-0.01em',
          }}>Re<em style={{ color: '#6366f1', fontStyle: 'italic' }}>kawl</em></span>
        </div>
        <div style={{
          flex: 1, maxWidth: 360, height: 30,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8, display: 'flex', alignItems: 'center',
          padding: '0 12px', gap: 8,
        }}>
          <span style={{ fontSize: 13, color: '#2a2a4a' }}>⌕</span>
          <span style={{ fontSize: 12, color: '#2a2a4a', fontFamily: "'DM Sans', sans-serif" }}>Search your saves…</span>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px 20px' }}>
        {/* Type tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['ALL', 'PAGES', 'IMAGES', 'SNIPPETS'].map((t, i) => (
            <div key={t} style={{
              padding: '4px 12px', borderRadius: 100, fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              background: i === 0 ? '#6366f1' : 'transparent',
              border: `1px solid ${i === 0 ? '#6366f1' : 'rgba(255,255,255,0.07)'}`,
              color: i === 0 ? '#fff' : '#3a3a5a',
            }}>{t}</div>
          ))}
        </div>

        {/* Active card — animating in */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`active-${articleIdx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: '#14141f',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 12, padding: '16px 18px', marginBottom: 12,
              boxShadow: '0 0 28px rgba(99,102,241,0.08)',
            }}
          >
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 11 }}>
              <img src={article.favicon} alt="" width={16} height={16}
                style={{ borderRadius: 3, flexShrink: 0, marginTop: 2, opacity: 0.85 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 13, fontWeight: 500, color: '#e0e0f0',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: 2,
                }}>{article.title}</p>
                <p style={{ fontSize: 10, color: '#3a3a5a', fontFamily: "'DM Mono', monospace" }}>
                  {article.domain}
                </p>
              </div>
              {/* Status */}
              {phase === 0 && (
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#6366f1',
                  flexShrink: 0, marginTop: 4,
                  animation: 'pendingPulse 1.2s ease-in-out infinite',
                }} />
              )}
              {phase >= 2 && summaryDone && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: '#4ade80',
                  }}
                >✓</motion.div>
              )}
            </div>

            {/* AI label + summary */}
            <div style={{
              background: 'rgba(99,102,241,0.04)',
              border: '1px solid rgba(99,102,241,0.08)',
              borderRadius: 8, padding: '10px 12px', marginBottom: 11,
              minHeight: 58,
            }}>
              <p style={{
                fontSize: 10, color: '#4a4a6a', fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.1em', marginBottom: 6,
              }}>AI SUMMARY</p>
              {phase === 0 ? (
                <p style={{ fontSize: 12, color: '#3a3a5a', fontStyle: 'italic' }}>
                  Reading it now…
                </p>
              ) : (
                <p style={{ fontSize: 12, color: '#6060a0', lineHeight: 1.65 }}>
                  {summary}
                  {!summaryDone && (
                    <span style={{
                      display: 'inline-block', width: 1.5, height: 11, background: '#6366f1',
                      marginLeft: 1, verticalAlign: 'middle',
                      animation: 'pendingPulse 0.7s steps(1) infinite',
                    }} />
                  )}
                </p>
              )}
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 11 }}>
              {phase >= 2 && summaryDone && article.tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}
                  style={{
                    padding: '3px 10px', borderRadius: 100, fontSize: 10,
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#8b8cf8', fontFamily: "'DM Mono', monospace",
                  }}
                >{tag}</motion.span>
              ))}
              {phase < 2 && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {[60, 48, 52].map((w, i) => (
                    <div key={i} style={{
                      height: 20, width: w, borderRadius: 100,
                      background: 'rgba(255,255,255,0.04)',
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 10, color: '#2a2a4a', fontFamily: "'DM Mono', monospace" }}>
                {article.timeAgo}
              </span>
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 9,
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#3a3a5a', fontFamily: "'DM Mono', monospace",
                }}>UNREAD</div>
                <div style={{
                  padding: '3px 7px', borderRadius: 6, fontSize: 11,
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.12)',
                  color: '#ef4444',
                }}>×</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Static complete cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {STATIC_CARDS.map((card) => (
            <div key={card.title} style={{
              background: '#111118',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10, padding: '14px 15px',
              opacity: card.isRead ? 0.55 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <img src={card.favicon} alt="" width={13} height={13}
                  style={{ borderRadius: 2, flexShrink: 0, marginTop: 1, opacity: 0.7 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 11, fontWeight: 500, color: '#b0b0d0',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 1,
                  }}>{card.title}</p>
                  <p style={{ fontSize: 9, color: '#2a2a4a', fontFamily: "'DM Mono', monospace" }}>{card.domain}</p>
                </div>
              </div>
              <p style={{
                fontSize: 11, color: '#4a4a6a', lineHeight: 1.55, marginBottom: 8,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{card.summary}</p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {card.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '1px 7px', borderRadius: 100, fontSize: 9,
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    color: '#6060a0', fontFamily: "'DM Mono', monospace",
                  }}>{tag}</span>
                ))}
              </div>
              <div style={{
                marginTop: 8, paddingTop: 8,
                borderTop: '1px solid rgba(255,255,255,0.03)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 9, color: '#2a2a4a', fontFamily: "'DM Mono', monospace" }}>{card.timeAgo}</span>
                <span style={{
                  fontSize: 9, color: card.isRead ? '#6366f1' : '#3a3a5a',
                  fontFamily: "'DM Mono', monospace",
                }}>{card.isRead ? '✓ READ' : 'UNREAD'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Right-click save demo (real video) ──────────────────────────────────────
function RightClickDemo() {
  return (
    <div style={{
      borderRadius: 14, background: '#0e0e18',
      border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.07)',
      maxWidth: 680, margin: '0 auto',
    }}>
      {/* macOS browser chrome */}
      <div style={{
        height: 38, background: '#111119',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
        </div>
        <div style={{
          flex: 1, maxWidth: 300, height: 22, margin: '0 auto',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 5, display: 'flex', alignItems: 'center', padding: '0 9px', gap: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#28c840', opacity: 0.5, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#3a3a5a', fontFamily: "'DM Mono', monospace" }}>
            rekawl.live · right-click to save
          </span>
        </div>
      </div>

      {/* Video */}
      <video
        src="/demo-extension.mov"
        autoPlay
        loop
        muted
        playsInline
        style={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'cover' }}
      />
    </div>
  )
}

// ─── Live demo (URL input) ─────────────────────────────────────────────────────
const LOADING_MESSAGES = ['Fetching the page…', 'Reading the content…', 'Generating summary…', 'Tagging it…']

interface DemoResult {
  type: 'page' | 'image'; title: string; domain: string; favicon: string
  imageUrl?: string; summary: string; tags: string[]
}

function LiveDemo() {
  const [url, setUrl] = useState('')
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msgIdx, setMsgIdx] = useState(0)
  const [result, setResult] = useState<DemoResult | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (phase !== 'loading') return
    let i = 0
    const t = setInterval(() => { i = Math.min(i + 1, LOADING_MESSAGES.length - 1); setMsgIdx(i) }, 2200)
    return () => clearInterval(t)
  }, [phase])

  const handleSave = async () => {
    const trimmed = url.trim()
    if (!trimmed || phase === 'loading') return
    setPhase('loading'); setError(''); setResult(null); setMsgIdx(0)
    try {
      const res = await fetch('/api/demo/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data); setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed'); setPhase('error')
    }
  }

  const reset = () => { setPhase('idle'); setUrl(''); setResult(null); setError(''); setTimeout(() => inputRef.current?.focus(), 50) }

  return (
    <div>
      {/* Input */}
      {(phase === 'idle' || phase === 'error') && (
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          background: '#12121c',
          border: '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: 14, padding: '6px 6px 6px 18px',
          transition: 'border-color 0.2s',
        }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
          onBlurCapture={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
        >
          <input
            ref={inputRef}
            type="url" value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="paste any URL to try it…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: '#e0e0f0', fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
            }}
          />
          <button onClick={handleSave} disabled={!url.trim()} style={{
            padding: '10px 20px', borderRadius: 10, flexShrink: 0,
            background: url.trim() ? '#6366f1' : 'rgba(255,255,255,0.04)',
            color: url.trim() ? '#fff' : '#3a3a5a', border: 'none',
            cursor: url.trim() ? 'pointer' : 'default',
            fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
            boxShadow: url.trim() ? '0 2px 12px rgba(99,102,241,0.35)' : 'none',
            transition: 'all 0.2s',
          }}>Save →</button>
        </div>
      )}

      {phase === 'error' && (
        <p style={{ marginTop: 10, fontSize: 12, color: '#f87171', fontFamily: "'DM Mono', monospace" }}>
          ✕ {error}
        </p>
      )}

      {/* Loading */}
      {phase === 'loading' && (
        <div style={{
          background: '#12121c', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 14, padding: 22,
          boxShadow: '0 0 40px rgba(99,102,241,0.08)',
          animation: 'pulseGlow 2s ease-in-out infinite',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 11, borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 7, width: '60%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
              <div style={{ height: 9, borderRadius: 4, background: 'rgba(255,255,255,0.04)', width: '35%', animation: 'shimmer 1.4s ease-in-out infinite', animationDelay: '0.2s' }} />
            </div>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', animation: 'pendingPulse 1.2s ease-in-out infinite' }} />
          </div>
          {[100, 80, 60].map((w, i) => (
            <div key={i} style={{ height: 9, borderRadius: 4, background: 'rgba(255,255,255,0.04)', marginBottom: 7, width: `${w}%`, animation: 'shimmer 1.4s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
          ))}
          <p style={{ marginTop: 14, fontSize: 10, color: '#3a3a5a', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>
            {LOADING_MESSAGES[msgIdx].toUpperCase()}
          </p>
        </div>
      )}

      {/* Result */}
      {phase === 'done' && result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div style={{ background: '#12121c', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, padding: 20, boxShadow: '0 8px 40px rgba(99,102,241,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <img src={result.favicon} alt="" width={20} height={20}
                style={{ borderRadius: 4, flexShrink: 0, marginTop: 2 }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f8', marginBottom: 2 }}>{result.title}</p>
                <p style={{ fontSize: 10, color: '#3a3a5a', fontFamily: "'DM Mono', monospace" }}>{result.domain}</p>
              </div>
              <span style={{ padding: '2px 9px', borderRadius: 100, fontSize: 9, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>SAVED</span>
            </div>
            {result.type === 'image' && result.imageUrl && (
              <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden' }}>
                <img src={result.imageUrl} alt="" style={{ width: '100%', maxHeight: 180, objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 9, padding: '11px 14px', marginBottom: 12 }}>
              <p style={{ fontSize: 9, color: '#5a5a8a', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: 7 }}>AI SUMMARY</p>
              <p style={{ fontSize: 13, color: '#6060a0', lineHeight: 1.7, fontWeight: 300 }}>{result.summary}</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {result.tags.map(tag => (
                <span key={tag} style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', fontSize: 10, color: '#8b8cf8', fontFamily: "'DM Mono', monospace" }}>{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={reset} style={{ padding: '8px 14px', borderRadius: 9, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#4a4a6a', fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#8080a0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#4a4a6a' }}
              >TRY ANOTHER</button>
              <Link href="/login" style={{ padding: '8px 18px', borderRadius: 9, background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 500, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 2px 10px rgba(99,102,241,0.35)' }}>
                Get started →
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0a0a0f; color: #f2f2fa; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

        @keyframes pendingPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.1; } }
        @keyframes shimmer {
          0% { background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%); background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 40px rgba(99,102,241,0.08); }
          50%      { box-shadow: 0 0 56px rgba(99,102,241,0.16); }
        }
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-25px) scale(1.07); }
          66%      { transform: translate(-15px,15px) scale(0.95); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }

        .wordmark { font-family: 'Instrument Serif', serif; font-size: 22px; color: #f2f2fa; text-decoration: none; letter-spacing: -0.01em; }
        .wordmark em { color: #6366f1; font-style: italic; }

        .nav-link { font-size: 14px; color: #5a5a7a; text-decoration: none; transition: color 0.15s; }
        .nav-link:hover { color: #f2f2fa; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 13px 26px; border-radius: 12px;
          background: #6366f1; color: #fff;
          font-size: 15px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          text-decoration: none; border: none; cursor: pointer;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary:hover { background: #5254e7; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(99,102,241,0.5); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 13px 24px; border-radius: 12px;
          background: transparent; color: #8080a0;
          font-size: 15px; font-weight: 300; font-family: 'DM Sans', sans-serif;
          text-decoration: none; border: 1px solid rgba(255,255,255,0.1);
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: #c0c0e0; }

        .section-label { font-family: 'DM Mono', monospace; font-size: 10px; color: #4a4a6a; letter-spacing: 0.18em; text-transform: uppercase; }

        @media (max-width: 900px) {
          .nav-mid { display: none !important; }
          .demo-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
        }
        @media (max-width: 600px) {
          .hero-h1 { font-size: clamp(44px, 13vw, 72px) !important; }
        }
      `}</style>

      {/* ── NAV ───────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
          background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Link href="/" className="wordmark" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" style={{ width: 20, height: 20, mixBlendMode: 'screen' }} />
          <span>Re<em>kawl</em></span>
        </Link>
        <div className="nav-mid" style={{ display: 'flex', gap: 28 }}>
          <a href="#demo" className="nav-link">Demo</a>
          <Link href="/pricing" className="nav-link">Pricing</Link>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/login" className="nav-link" style={{ padding: '7px 14px', fontSize: 14 }}>Sign in</Link>
          <Link href="/login" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Get started</Link>
        </div>
      </motion.nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '120px 32px 80px',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', width: 640, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)', top: '-5%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(50px)', pointerEvents: 'none', animation: 'blob 16s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)', bottom: '20%', right: '8%', filter: 'blur(40px)', pointerEvents: 'none', animation: 'blob 20s ease-in-out infinite reverse' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
            <p className="section-label" style={{ marginBottom: 24 }}>
              read-later, but it actually works
            </p>
          </motion.div>

          <motion.h1
            className="hero-h1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(56px, 8.5vw, 100px)',
              lineHeight: 0.95, letterSpacing: '-0.03em',
              color: '#f2f2fa', fontWeight: 400, marginBottom: 28,
            }}
          >
            Save now.<br />
            <em style={{ color: '#6366f1' }}>Rekawl</em> later.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#6060a0', fontWeight: 300, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 44px' }}
          >
            Chrome extension that saves anything. AI reads it. You find it instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}
          >
            <Link href="/login" className="btn-primary">Get started free</Link>
            <a href="#demo" className="btn-ghost">See it in action ↓</a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{ fontSize: 10, color: '#2a2a4a', fontFamily: "'DM Mono', monospace", letterSpacing: '0.14em' }}
          >
            FREE · 10 SAVES/MONTH · NO CREDIT CARD
          </motion.p>
        </div>
      </section>

      {/* ── PRODUCT DEMO ──────────────────────────────────────── */}
      <section id="demo" style={{
        background: '#050508',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '96px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 500, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)',
          top: '10%', right: '-5%', filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="section-label" style={{ marginBottom: 14 }}>see the whole flow</p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(36px, 5vw, 54px)',
                color: '#f2f2fa', fontWeight: 400,
                letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14,
              }}>
                Right-click. Saved.<br /><em style={{ color: '#6366f1' }}>Remembered forever.</em>
              </h2>
              <p style={{ fontSize: 15, color: '#4a4a6a', fontWeight: 300, maxWidth: 460, margin: '0 auto' }}>
                One right-click while browsing. AI reads it, writes a summary, and tags it. Your library, organized itself.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div>
              <p style={{
                textAlign: 'center', marginBottom: 16,
                fontSize: 10, color: '#3a3a5a',
                fontFamily: "'DM Mono', monospace", letterSpacing: '0.14em',
              }}>STEP 1 — RIGHT-CLICK TO SAVE ANYWHERE</p>
              <RightClickDemo />
            </div>
          </FadeUp>

          {/* Connector */}
          <FadeUp delay={0.15}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 16, padding: '18px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 18, color: '#2a2a4a' }}>↓</span>
                <span style={{ fontSize: 10, color: '#2a2a4a', fontFamily: "'DM Mono', monospace", letterSpacing: '0.14em' }}>
                  LANDS IN YOUR LIBRARY
                </span>
              </div>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div>
              <p style={{
                textAlign: 'center', marginBottom: 16,
                fontSize: 10, color: '#3a3a5a',
                fontFamily: "'DM Mono', monospace", letterSpacing: '0.14em',
              }}>STEP 2 — AI READS IT, YOU FIND IT</p>
              <AutoDemo />
            </div>
          </FadeUp>

          {/* Live demo input */}
          <FadeUp delay={0.2}>
            <div style={{
              marginTop: 32, padding: '28px 28px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <p className="section-label">try it yourself</p>
                <span style={{
                  padding: '2px 9px', borderRadius: 100, fontSize: 9,
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  color: '#4ade80', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
                }}>LIVE · NO LOGIN</span>
              </div>
              <LiveDemo />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section style={{
        background: '#0a0a0f',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '96px 32px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p className="section-label" style={{ marginBottom: 14 }}>how it works</p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(36px, 5vw, 52px)',
                color: '#f2f2fa', fontWeight: 400, letterSpacing: '-0.02em',
              }}>
                three steps. that's it.
              </h2>
            </div>
          </FadeUp>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {[
              {
                num: '01',
                sym: '⊕',
                title: 'Save anything',
                desc: 'Click the extension popup to save a full page. Right-click any image. Highlight text and right-click. Works on every website.',
                note: 'Pages, images, text',
              },
              {
                num: '02',
                sym: '◈',
                title: 'AI reads it',
                desc: 'Every save gets a 2–3 sentence summary and 3–5 tags generated by Claude, automatically. You never have to touch it.',
                note: 'Under 2 seconds',
              },
              {
                num: '03',
                sym: '◎',
                title: 'Find it instantly',
                desc: 'Full-text search across titles, summaries, and page content. Filter by type or tag. It actually works.',
                note: 'No more forgetting',
              },
            ].map((f, i) => (
              <FadeUp key={f.num} delay={i * 0.1}>
                <div style={{
                  padding: '36px 32px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.03)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, color: '#6366f1' }}>{f.sym}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#2a2a4a' }}>{f.num}</span>
                  </div>
                  <h3 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 24, color: '#f2f2fa', fontWeight: 400, marginBottom: 12,
                  }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#4a4a6a', lineHeight: 1.7, fontWeight: 300, marginBottom: 20 }}>{f.desc}</p>
                  <p style={{ fontSize: 10, color: '#6366f1', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em' }}>
                    {f.note.toUpperCase()}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ────────────────────────────────────── */}
      <section style={{
        background: '#050508',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '96px 32px',
      }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p className="section-label" style={{ marginBottom: 14 }}>pricing</p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(36px, 5vw, 52px)',
                color: '#f2f2fa', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12,
              }}>simple enough.</h2>
              <p style={{ fontSize: 15, color: '#3a3a5a', fontWeight: 300 }}>
                free to start, $5 when you need more.
              </p>
            </div>
          </FadeUp>

          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FadeUp delay={0}>
              <div style={{
                padding: '36px 32px', borderRadius: 18,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                height: '100%',
              }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#3a3a5a', letterSpacing: '0.16em', marginBottom: 16 }}>FREE</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 52, color: '#f2f2fa', fontWeight: 400, lineHeight: 1 }}>$0</span>
                  <span style={{ fontSize: 14, color: '#2a2a4a' }}>/month</span>
                </div>
                <p style={{ fontSize: 14, color: '#2a2a4a', marginBottom: 28, fontWeight: 300 }}>for trying things out</p>
                {['10 saves/month', 'Pages, images, text', 'AI summaries + tags', 'Full-text search'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ color: '#6366f1', fontSize: 10, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 14, color: '#5a5a7a', fontWeight: 300 }}>{f}</span>
                  </div>
                ))}
                <Link href="/login" style={{ display: 'block', marginTop: 28, padding: '12px 0', textAlign: 'center', borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)', color: '#f2f2fa', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'background 0.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
                >Start free</Link>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div style={{
                padding: '36px 32px', borderRadius: 18, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(145deg, #0f0f20, #111128)',
                border: '1px solid rgba(99,102,241,0.28)',
                boxShadow: '0 0 48px rgba(99,102,241,0.07)',
                height: '100%',
              }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#8b8cf8', letterSpacing: '0.16em' }}>PRO</p>
                    <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 9, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#8b8cf8', fontFamily: "'DM Mono', monospace" }}>POPULAR</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 52, color: '#f2f2fa', fontWeight: 400, lineHeight: 1 }}>$5</span>
                    <span style={{ fontSize: 14, color: '#4a4a6a' }}>/month</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#3a3a5a', marginBottom: 28, fontWeight: 300 }}>for people who actually browse</p>
                  {['Unlimited saves', 'Priority processing', 'Full search history', 'Everything in Free'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ color: '#8b5cf6', fontSize: 10, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>✦</span>
                      <span style={{ fontSize: 14, color: '#5a5a80', fontWeight: 300 }}>{f}</span>
                    </div>
                  ))}
                  <Link href="/pricing" style={{ display: 'block', marginTop: 28, padding: '12px 0', textAlign: 'center', borderRadius: 11, background: '#6366f1', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500, boxShadow: '0 4px 16px rgba(99,102,241,0.35)', transition: 'background 0.15s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#5254e7')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#6366f1')}
                  >Get Pro →</Link>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section style={{
        background: '#0a0a0f', padding: '100px 32px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.14), transparent 65%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <FadeUp>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 580, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(40px, 6vw, 64px)',
              color: '#f2f2fa', fontWeight: 400, letterSpacing: '-0.02em',
              lineHeight: 1.05, marginBottom: 20,
            }}>
              your internet memory,<br />
              <em style={{ color: '#6366f1' }}>finally working</em>
            </h2>
            <p style={{ fontSize: 16, color: '#3a3a5a', fontWeight: 300, lineHeight: 1.6, marginBottom: 40 }}>
              Join and stop losing everything you wanted to read.
            </p>
            <Link href="/login" className="btn-primary" style={{ fontSize: 16, padding: '15px 34px' }}>
              Get started free
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding: '28px 32px', background: '#0a0a0f', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="footer-inner" style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="wordmark" style={{ fontSize: 18, color: '#2a2a4a', display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" style={{ width: 18, height: 18, opacity: 0.35 }} />
            <span>Re<em style={{ color: '#3a3a6a' }}>kawl</em></span>
          </Link>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Pricing', '/pricing'], ['Sign in', '/login']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 11, color: '#2a2a4a', textDecoration: 'none', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', transition: 'color 0.15s' }}
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
