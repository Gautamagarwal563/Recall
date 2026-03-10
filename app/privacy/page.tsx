'use client'

import Link from 'next/link'

export default function PrivacyPage() {
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
          <Link href="/support" style={{
            fontSize: 12, color: '#4a4a6a', textDecoration: 'none',
            fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#8080a0')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#4a4a6a')}
          >
            SUPPORT →
          </Link>
        </nav>

        <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 96px' }}>

          <p style={{
            fontSize: 10, color: '#3a3a5a', fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.16em', marginBottom: 20,
          }}>LEGAL · PRIVACY</p>

          <h1 style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 42,
            color: '#f2f2fa', fontWeight: 400, letterSpacing: '-0.02em',
            lineHeight: 1.1, marginBottom: 12,
          }}>
            Privacy <em style={{ color: '#6366f1' }}>Policy</em>
          </h1>
          <p style={{ fontSize: 13, color: '#3a3a5a', fontFamily: "'DM Mono', monospace", marginBottom: 56 }}>
            Last updated: March 10, 2026
          </p>

          {[
            {
              title: 'What we collect',
              body: `When you create an account, we collect your email address and a hashed password. When you save content, we store the URL of the page, any text snippet you highlighted, image URLs, and AI-generated summaries and tags. We also store an authentication token in your browser's local storage to keep you signed in.`,
            },
            {
              title: 'How we use it',
              body: `We use your data solely to provide the Rekawl service — to save, organize, summarize, and let you search your library. We use Anthropic's Claude API to generate summaries and tags from the content you save. We use Firecrawl to extract readable content from web pages you save. Neither service stores your data beyond processing each request.`,
            },
            {
              title: 'What we do not do',
              body: `We do not sell your data to anyone. We do not use your saved content for advertising. We do not share your data with third parties except the processors listed above (Anthropic, Firecrawl, Supabase for database hosting, Stripe for payments) — and only to the extent necessary to operate the service.`,
            },
            {
              title: 'Payments',
              body: `If you upgrade to Pro, payments are processed by Stripe. We never see or store your card details. Stripe may collect billing information subject to their own privacy policy. We store only your Stripe customer ID and subscription status to manage your plan.`,
            },
            {
              title: 'Chrome extension',
              body: `The Rekawl Chrome extension stores your authentication token in chrome.storage.local on your device. It reads the URL and title of the active tab only when you explicitly click the extension icon or use the right-click menu to save something. It does not run in the background, does not track your browsing history, and does not read page content unless you initiate a save.`,
            },
            {
              title: 'Data retention',
              body: `Your saves and account data are retained as long as your account is active. You can delete individual saves at any time from your dashboard. To delete your entire account and all associated data, email us at hello@rekawl.live and we will process it within 7 days.`,
            },
            {
              title: 'Security',
              body: `All data is transmitted over HTTPS. Passwords are hashed before storage. We use Supabase (hosted on AWS) for our database, which is encrypted at rest. We do not have access to your password.`,
            },
            {
              title: 'Contact',
              body: `Questions about this policy? Email hello@rekawl.live — we'll respond within 48 hours.`,
            },
          ].map((section, i) => (
            <div key={i} style={{
              marginBottom: 40,
              paddingBottom: 40,
              borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontSize: 22,
                color: '#d0d0f0', fontWeight: 400, marginBottom: 12,
              }}>{section.title}</h2>
              <p style={{ fontSize: 15, color: '#707090', lineHeight: 1.8 }}>
                {section.body}
              </p>
            </div>
          ))}

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
