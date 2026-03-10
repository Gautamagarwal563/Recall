'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

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
  type: 'page' | 'image' | 'text'
  imageUrl: string | null
  snippet: string | null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function hostname(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
}

const TYPE_TABS: { label: string; value: 'page' | 'image' | 'text' | null; icon: string }[] = [
  { label: 'All saves', value: null, icon: '◈' },
  { label: 'Pages', value: 'page', icon: '⊕' },
  { label: 'Images', value: 'image', icon: '▣' },
  { label: 'Snippets', value: 'text', icon: '❝' },
]

const EMPTY_STATE_MESSAGES: Record<'page' | 'image' | 'text' | 'null', { title: string; desc: string }> = {
  'null': { title: 'Nothing saved yet', desc: 'Install the Chrome extension and start saving pages, images, and snippets.' },
  page: { title: 'No pages saved', desc: 'Click the extension popup on any page to save it.' },
  image: { title: 'No images saved', desc: 'Right-click any image on the web and choose "Save to Rekawl".' },
  text: { title: 'No snippets saved', desc: 'Highlight any text, right-click, and save it.' },
}

function DashboardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [saves, setSaves] = useState<Save[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'page' | 'image' | 'text' | null>(null)
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [savesThisMonth, setSavesThisMonth] = useState(0)
  const [showUpgradeToast, setShowUpgradeToast] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const fetchSaves = useCallback(async (q?: string, tag?: string, type?: 'page' | 'image' | 'text' | null) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (tag) params.set('tag', tag)
    if (type) params.set('type', type)
    const res = await fetch(`/api/saves?${params}`)
    if (res.status === 401) { router.push('/login'); return }
    const data = await res.json()
    setSaves(data.saves ?? [])
    setLoading(false)
  }, [router])

  const fetchMe = useCallback(async () => {
    const res = await fetch('/api/auth/me')
    if (!res.ok) return
    const data = await res.json()
    setPlan(data.plan ?? 'free')
    setSavesThisMonth(data.savesThisMonth ?? 0)
  }, [])

  useEffect(() => { fetchSaves(); fetchMe() }, [fetchSaves, fetchMe])

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgradeToast(true)
      fetchMe()
      const url = new URL(window.location.href)
      url.searchParams.delete('upgraded')
      window.history.replaceState({}, '', url.toString())
      setTimeout(() => setShowUpgradeToast(false), 4500)
    }
  }, [searchParams, fetchMe])

  useEffect(() => {
    const hasPending = saves.some(s => s.status === 'pending')
    if (!hasPending) return
    const id = setTimeout(() => fetchSaves(search || undefined, activeTag || undefined, activeType), 5000)
    return () => clearTimeout(id)
  }, [saves, search, activeTag, activeType, fetchSaves])

  // Global '/' to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSearch = (val: string) => {
    setSearch(val)
    setActiveTag(null)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => fetchSaves(val || undefined, undefined, activeType), 280)
  }

  const handleTagFilter = (tag: string) => {
    const next = activeTag === tag ? null : tag
    setActiveTag(next)
    setSearch('')
    fetchSaves(undefined, next ?? undefined, activeType)
  }

  const handleTypeTab = (type: 'page' | 'image' | 'text' | null) => {
    setActiveType(type)
    setSearch('')
    setActiveTag(null)
    fetchSaves(undefined, undefined, type)
  }

  const handleReadToggle = async (save: Save) => {
    const newVal = !save.isRead
    setSaves(s => s.map(x => x.id === save.id ? { ...x, isRead: newVal } : x))
    await fetch(`/api/saves/${save.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: newVal }),
    })
  }

  const handleDelete = async (id: string) => {
    setSaves(s => s.filter(x => x.id !== id))
    await fetch(`/api/saves/${id}`, { method: 'DELETE' })
    fetchMe()
  }

  const handleUpgrade = async () => {
    setCheckoutLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setCheckoutLoading(false)
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setPortalLoading(false)
  }

  const allTags = Array.from(new Set(saves.flatMap(s => s.tags ?? [])))
  const typeCounts = {
    page: saves.filter(s => s.type === 'page').length,
    image: saves.filter(s => s.type === 'image').length,
    text: saves.filter(s => s.type === 'text').length,
  }
  const unreadCount = saves.filter(s => !s.isRead).length
  const emptyState = activeType ? EMPTY_STATE_MESSAGES[activeType] : EMPTY_STATE_MESSAGES['null']
  const usagePct = Math.min(100, (savesThisMonth / 10) * 100)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #080810; font-family: 'DM Sans', sans-serif; color: #e0e0f0; }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer {
          0%{background-position:-400px 0} 100%{background-position:400px 0}
        }

        .skeleton {
          background: linear-gradient(90deg,#111120 25%,#1a1a30 50%,#111120 75%);
          background-size: 400px 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
        .card-in { animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }

        .nav-item {
          display:flex; align-items:center; justify-content:space-between;
          padding:8px 12px; border-radius:9px; cursor:pointer;
          font-size:13px; color:#5a5a80; transition:all 0.15s;
          border:none; background:transparent; width:100%; text-align:left;
          font-family:'DM Sans',sans-serif;
        }
        .nav-item:hover { background:rgba(255,255,255,0.04); color:#9090b0; }
        .nav-item.active { background:rgba(99,102,241,0.12); color:#c4c6ff; }

        .save-card {
          background:#0e0e1c;
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px;
          transition:border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          position:relative;
          overflow:hidden;
        }
        .save-card:hover {
          border-color:rgba(99,102,241,0.25);
          box-shadow:0 8px 40px rgba(0,0,0,0.35);
          transform:translateY(-1px);
        }
        .card-actions {
          opacity:0; transition:opacity 0.15s;
        }
        .save-card:hover .card-actions { opacity:1; }

        .search-wrap {
          display:flex; align-items:center; gap:8px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:11px; padding:0 14px;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .search-wrap:focus-within {
          border-color:rgba(99,102,241,0.35);
          box-shadow:0 0 0 3px rgba(99,102,241,0.07);
        }
        .search-input {
          flex:1; background:none; border:none; outline:none;
          font-size:14px; color:#e0e0f0;
          font-family:'DM Sans',sans-serif; padding:10px 0;
        }
        .search-input::placeholder { color:#3a3a5a; }

        .tag-btn {
          padding:3px 10px; border-radius:100px;
          border:1px solid rgba(99,102,241,0.18);
          background:rgba(99,102,241,0.06);
          color:#6060a0; font-size:10px;
          font-family:'DM Mono',monospace;
          cursor:pointer; transition:all 0.15s; white-space:nowrap;
        }
        .tag-btn:hover, .tag-btn.active {
          background:rgba(99,102,241,0.18);
          border-color:rgba(99,102,241,0.35);
          color:#a5b4fc;
        }

        .action-btn {
          padding:5px 10px; border-radius:7px; cursor:pointer;
          font-size:10px; font-family:'DM Mono',monospace;
          letter-spacing:0.05em; transition:all 0.15s; border:1px solid;
        }

        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#1e1e38; border-radius:4px; }

        @media(max-width:768px) {
          .sidebar { display:none !important; }
          .main-pad { padding:16px !important; }
        }
      `}</style>

      {/* ── Success toast ── */}
      {showUpgradeToast && (
        <div style={{
          position:'fixed', top:20, left:'50%', transform:'translateX(-50%)',
          zIndex:200, animation:'slideDown 0.35s cubic-bezier(0.22,1,0.36,1) both',
          background:'linear-gradient(135deg,#16a34a,#15803d)',
          color:'#fff', padding:'13px 24px', borderRadius:13,
          fontSize:14, fontWeight:500,
          boxShadow:'0 8px 32px rgba(22,163,74,0.4)',
          display:'flex', alignItems:'center', gap:10,
          whiteSpace:'nowrap',
        }}>
          <span style={{fontSize:16}}>✦</span> You&apos;re on Pro — unlimited saves!
        </div>
      )}

      <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'#080810' }}>

        {/* ── Navbar ── */}
        <nav style={{
          height:56, display:'flex', alignItems:'center', gap:16,
          padding:'0 20px', flexShrink:0,
          background:'rgba(8,8,16,0.9)', backdropFilter:'blur(16px)',
          borderBottom:'1px solid rgba(255,255,255,0.05)',
          position:'sticky', top:0, zIndex:50,
        }}>
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            fontFamily:"'Instrument Serif',serif",
            fontSize:20, color:'#f0f0fa', flexShrink:0, letterSpacing:'-0.01em',
            userSelect:'none',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" style={{ width:22, height:22, mixBlendMode:'screen' }} />
            <span>Re<em style={{color:'#6366f1', fontStyle:'italic'}}>kawl</em></span>
          </div>

          {/* Search */}
          <div className="search-wrap" style={{flex:1, maxWidth:520, margin:'0 auto'}}>
            <span style={{color:'#3a3a5a', fontSize:15, flexShrink:0}}>⌕</span>
            <input
              ref={searchRef}
              className="search-input"
              type="text"
              placeholder="Search saves…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            {!search && (
              <kbd style={{
                fontSize:10, color:'#2a2a4a', fontFamily:"'DM Mono',monospace",
                padding:'2px 5px', borderRadius:4,
                border:'1px solid rgba(255,255,255,0.07)',
                flexShrink:0,
              }}>/</kbd>
            )}
            {search && (
              <button onClick={() => handleSearch('')} style={{
                background:'none', border:'none', color:'#4a4a6a', cursor:'pointer',
                fontSize:14, flexShrink:0, padding:'0 2px',
              }}>×</button>
            )}
          </div>

          {/* Plan badge + avatar */}
          <div style={{display:'flex', alignItems:'center', gap:10, flexShrink:0}}>
            {plan === 'pro' && (
              <span style={{
                padding:'3px 9px', borderRadius:100, fontSize:9,
                background:'rgba(99,102,241,0.15)',
                border:'1px solid rgba(99,102,241,0.3)',
                color:'#8b8cf8', fontFamily:"'DM Mono',monospace", letterSpacing:'0.1em',
              }}>PRO</span>
            )}
            <div style={{
              width:30, height:30, borderRadius:'50%', flexShrink:0,
              background:plan==='pro'
                ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                : 'linear-gradient(135deg,#1e1e38,#2a2a48)',
              border:plan==='pro' ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, color:plan==='pro' ? '#fff' : '#3a3a5a',
            }}>
              {plan === 'pro' ? '✦' : ''}
            </div>
          </div>
        </nav>

        <div style={{display:'flex', flex:1, overflow:'hidden'}}>

          {/* ── Sidebar ── */}
          <aside className="sidebar" style={{
            width:220, flexShrink:0, overflowY:'auto',
            background:'#0a0a14',
            borderRight:'1px solid rgba(255,255,255,0.05)',
            padding:'20px 12px',
            display:'flex', flexDirection:'column', gap:6,
          }}>

            {/* Saves count */}
            <div style={{padding:'0 12px', marginBottom:8}}>
              <p style={{fontSize:10, color:'#3a3a5a', fontFamily:"'DM Mono',monospace", letterSpacing:'0.12em', marginBottom:2}}>
                YOUR LIBRARY
              </p>
              {!loading && (
                <p style={{fontSize:22, fontFamily:"'Instrument Serif',serif", color:'#e0e0f0', fontWeight:400}}>
                  {saves.length} <span style={{fontSize:13, color:'#3a3a5a', fontFamily:"'DM Sans',sans-serif", fontWeight:300}}>saves</span>
                </p>
              )}
            </div>

            {/* Type nav */}
            <div style={{marginBottom:8}}>
              {TYPE_TABS.map(tab => {
                const count = tab.value ? typeCounts[tab.value] : saves.length
                return (
                  <button
                    key={tab.label}
                    className={`nav-item${activeType === tab.value && !search && !activeTag ? ' active' : ''}`}
                    onClick={() => handleTypeTab(tab.value)}
                  >
                    <span style={{display:'flex', alignItems:'center', gap:8}}>
                      <span style={{fontSize:12, opacity:0.7}}>{tab.icon}</span>
                      {tab.label}
                    </span>
                    {!loading && count > 0 && (
                      <span style={{
                        fontSize:10, color:'inherit', opacity:0.5,
                        fontFamily:"'DM Mono',monospace",
                      }}>{count}</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Divider */}
            <div style={{height:1, background:'rgba(255,255,255,0.05)', margin:'4px 0'}} />

            {/* Tags */}
            {allTags.length > 0 && (
              <div style={{padding:'8px 0'}}>
                <p style={{
                  fontSize:9, color:'#2a2a4a', fontFamily:"'DM Mono',monospace",
                  letterSpacing:'0.14em', padding:'0 12px', marginBottom:8,
                }}>TAGS</p>
                <div style={{display:'flex', flexDirection:'column', gap:1}}>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`nav-item${activeTag === tag ? ' active' : ''}`}
                      onClick={() => handleTagFilter(tag)}
                    >
                      <span style={{display:'flex', alignItems:'center', gap:6}}>
                        <span style={{fontSize:9, opacity:0.5}}>#</span>
                        {tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Spacer */}
            <div style={{flex:1}} />

            {/* Divider */}
            <div style={{height:1, background:'rgba(255,255,255,0.05)', margin:'4px 0'}} />

            {/* Plan section */}
            {plan === 'free' ? (
              <div style={{padding:'12px', borderRadius:12, background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.12)'}}>
                {/* Usage bar */}
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'baseline'}}>
                  <span style={{fontSize:11, color:'#6060a0', fontFamily:"'DM Mono',monospace"}}>
                    {savesThisMonth}/10 this month
                  </span>
                  {savesThisMonth >= 8 && (
                    <span style={{fontSize:9, color:'#ef4444', fontFamily:"'DM Mono',monospace"}}>
                      {10 - savesThisMonth} LEFT
                    </span>
                  )}
                </div>
                <div style={{
                  height:4, borderRadius:100,
                  background:'rgba(255,255,255,0.07)', marginBottom:12, overflow:'hidden',
                }}>
                  <div style={{
                    height:'100%', borderRadius:100,
                    width:`${usagePct}%`,
                    background:savesThisMonth >= 8 ? 'linear-gradient(90deg,#f97316,#ef4444)' : '#6366f1',
                    transition:'width 0.4s',
                  }} />
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={checkoutLoading}
                  style={{
                    width:'100%', padding:'9px 0', borderRadius:9,
                    background:checkoutLoading ? 'rgba(99,102,241,0.4)' : '#6366f1',
                    color:'#fff', border:'none', cursor:checkoutLoading ? 'not-allowed' : 'pointer',
                    fontSize:12, fontWeight:500, fontFamily:"'DM Sans',sans-serif",
                    boxShadow:'0 4px 14px rgba(99,102,241,0.3)',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!checkoutLoading) (e.currentTarget as HTMLButtonElement).style.background = '#5254e7' }}
                  onMouseLeave={e => { if (!checkoutLoading) (e.currentTarget as HTMLButtonElement).style.background = '#6366f1' }}
                >
                  {checkoutLoading ? 'Loading…' : 'Upgrade to Pro →'}
                </button>
                <p style={{
                  textAlign:'center', marginTop:8, fontSize:9,
                  color:'#2a2a4a', fontFamily:"'DM Mono',monospace", letterSpacing:'0.08em',
                }}>$5/MO · CANCEL ANYTIME</p>
              </div>
            ) : (
              <div style={{padding:'0 4px'}}>
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="nav-item"
                  style={{width:'100%', justifyContent:'flex-start', gap:8}}
                >
                  <span style={{fontSize:11}}>⚙</span>
                  {portalLoading ? 'Loading…' : 'Manage billing'}
                </button>
              </div>
            )}
          </aside>

          {/* ── Main content ── */}
          <main className="main-pad" style={{flex:1, overflowY:'auto', padding:'24px 28px'}}>

            {/* Filter breadcrumb */}
            {(activeTag || search || activeType) && (
              <div style={{
                display:'flex', alignItems:'center', gap:8, marginBottom:16,
                fontSize:12, color:'#4a4a6a', fontFamily:"'DM Mono',monospace",
              }}>
                {activeType && <span style={{color:'#6366f1'}}>#{activeType}</span>}
                {activeTag && <span style={{color:'#6366f1'}}>#{activeTag}</span>}
                {search && <span>"{search}"</span>}
                <button onClick={() => { handleSearch(''); setActiveTag(null); setActiveType(null); fetchSaves() }} style={{
                  background:'none', color:'#3a3a5a', cursor:'pointer',
                  fontSize:11, padding:'1px 6px', borderRadius:4,
                  border:'1px solid rgba(255,255,255,0.06)',
                  transition:'color 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#8080a0')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#3a3a5a')}
                >clear ×</button>
              </div>
            )}

            {/* Unread notice */}
            {!loading && unreadCount > 0 && !search && !activeTag && (
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                marginBottom:18,
              }}>
                <p style={{fontSize:11, color:'#3a3a5a', fontFamily:"'DM Mono',monospace", letterSpacing:'0.08em'}}>
                  {saves.length} SAVE{saves.length !== 1 ? 'S' : ''} · {unreadCount} UNREAD
                </p>
              </div>
            )}

            {/* Skeletons */}
            {loading && (
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',
                gap:14,
              }}>
                {Array.from({length:6}).map((_, i) => (
                  <div key={i} className="skeleton" style={{
                    height:200, borderRadius:14,
                    animationDelay:`${i*0.08}s`,
                  }} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && saves.length === 0 && (
              <div style={{
                display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', padding:'80px 24px', textAlign:'center',
              }}>
                {search || activeTag ? (
                  <>
                    <div style={{fontSize:48, marginBottom:16, opacity:0.15}}>◎</div>
                    <h3 style={{
                      fontFamily:"'Instrument Serif',serif",
                      fontSize:26, color:'#c0c0e0', fontWeight:400, marginBottom:8,
                    }}>Nothing found</h3>
                    <p style={{fontSize:14, color:'#4a4a6a', fontWeight:300}}>
                      {search ? `No saves matching "${search}"` : `No saves tagged "${activeTag}"`}
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{
                      width:72, height:72, borderRadius:20, marginBottom:20,
                      background:'rgba(99,102,241,0.08)',
                      border:'1px solid rgba(99,102,241,0.15)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:28, color:'#4a4a6a',
                    }}>◈</div>
                    <h3 style={{
                      fontFamily:"'Instrument Serif',serif",
                      fontSize:28, color:'#c0c0e0', fontWeight:400, marginBottom:10,
                    }}>{emptyState.title}</h3>
                    <p style={{fontSize:14, color:'#4a4a6a', fontWeight:300, maxWidth:320, lineHeight:1.65}}>
                      {emptyState.desc}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Cards grid */}
            {!loading && saves.length > 0 && (
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',
                gap:14,
              }}>
                {saves.map((save, i) => (
                  <SaveCard
                    key={save.id}
                    save={save}
                    index={i}
                    onReadToggle={handleReadToggle}
                    onDelete={handleDelete}
                    onTagClick={handleTagFilter}
                    activeTag={activeTag}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

// ─── Save Card ────────────────────────────────────────────────────────────────
function SaveCard({
  save, index, onReadToggle, onDelete, onTagClick, activeTag,
}: {
  save: Save
  index: number
  onReadToggle: (s: Save) => void
  onDelete: (id: string) => void
  onTagClick: (tag: string) => void
  activeTag: string | null
}) {
  const isImage = save.type === 'image'
  const isText = save.type === 'text'

  return (
    <div
      className="save-card card-in"
      style={{
        animationDelay:`${index * 0.03}s`,
        opacity: save.isRead ? 0.5 : 1,
        transition:'opacity 0.2s',
        display:'flex', flexDirection:'column',
      }}
    >
      {/* ── IMAGE: full-bleed thumbnail ── */}
      {isImage && save.imageUrl && (
        <a href={save.url} target="_blank" rel="noopener noreferrer" style={{display:'block', textDecoration:'none'}}>
          <div style={{ height:200, overflow:'hidden', position:'relative', borderRadius:'14px 14px 0 0' }}>
            <img
              src={save.imageUrl} alt={save.title || ''}
              style={{width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.4s ease'}}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
            />
            <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(14,14,28,0.85) 100%)',
            }} />
            {/* Domain pill over image */}
            <div style={{
              position:'absolute', top:12, left:12,
              display:'flex', alignItems:'center', gap:5,
              padding:'4px 9px', borderRadius:100,
              background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)',
            }}>
              {save.faviconUrl && (
                <img src={save.faviconUrl} alt="" width={12} height={12}
                  style={{borderRadius:2, opacity:0.9}}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <span style={{fontSize:10, color:'rgba(255,255,255,0.7)', fontFamily:"'DM Mono',monospace"}}>
                {hostname(save.url)}
              </span>
            </div>
            {/* Time + status over image */}
            <div style={{position:'absolute', top:12, right:12, display:'flex', alignItems:'center', gap:6}}>
              {save.status === 'pending' && (
                <div style={{width:6, height:6, borderRadius:'50%', background:'#6366f1', animation:'pulse 1.3s ease-in-out infinite'}} />
              )}
              <span style={{fontSize:10, color:'rgba(255,255,255,0.5)', fontFamily:"'DM Mono',monospace"}}>
                {timeAgo(save.createdAt)}
              </span>
            </div>
            {/* Title over image at bottom */}
            {save.title && (
              <div style={{position:'absolute', bottom:0, left:0, right:0, padding:'12px 14px'}}>
                <p style={{
                  fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.95)',
                  lineHeight:1.3,
                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                  overflow:'hidden',
                } as React.CSSProperties}>{save.title}</p>
              </div>
            )}
          </div>
        </a>
      )}

      {/* ── TEXT SNIPPET: quote-first layout ── */}
      {isText && save.snippet && (
        <div style={{
          padding:'18px 20px 0',
          borderBottom:'1px solid rgba(255,255,255,0.04)',
          marginBottom:0,
        }}>
          <div style={{
            background:'rgba(99,102,241,0.05)',
            border:'1px solid rgba(99,102,241,0.12)',
            borderLeft:'3px solid rgba(99,102,241,0.5)',
            borderRadius:'0 10px 10px 0',
            padding:'14px 16px',
            marginBottom:14,
          }}>
            <p style={{
              fontSize:13, color:'#8080c0', fontStyle:'italic', lineHeight:1.75,
              display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical',
              overflow:'hidden',
            } as React.CSSProperties}>
              &ldquo;{save.snippet}&rdquo;
            </p>
          </div>
        </div>
      )}

      <div style={{padding: isImage ? '14px 16px' : '16px 18px', flex:1, display:'flex', flexDirection:'column'}}>

        {/* ── META ROW (non-image) ── */}
        {!isImage && (
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              {save.faviconUrl && (
                <img src={save.faviconUrl} alt="" width={13} height={13}
                  style={{borderRadius:3, opacity:0.75}}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <span style={{fontSize:10, color:'#3a3a5a', fontFamily:"'DM Mono',monospace"}}>
                {hostname(save.url)}
              </span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              {save.status === 'pending' && (
                <div style={{width:6, height:6, borderRadius:'50%', background:'#6366f1', animation:'pulse 1.3s ease-in-out infinite'}} />
              )}
              {save.status === 'failed' && (
                <span style={{fontSize:9, color:'#ef4444', fontFamily:"'DM Mono',monospace", padding:'1px 5px', background:'rgba(239,68,68,0.1)', borderRadius:3}}>FAILED</span>
              )}
              <span style={{fontSize:10, color:'#2a2a4a', fontFamily:"'DM Mono',monospace"}}>
                {timeAgo(save.createdAt)}
              </span>
            </div>
          </div>
        )}

        {/* ── TITLE (page + text, not image since it's overlaid) ── */}
        {!isImage && (
          <a
            href={save.url} target="_blank" rel="noopener noreferrer"
            style={{
              display:'-webkit-box', fontSize:14, fontWeight:500, color:'#d0d0f0',
              textDecoration:'none', lineHeight:1.45, marginBottom:10,
              overflow:'hidden',
              WebkitLineClamp:2, WebkitBoxOrient:'vertical',
              transition:'color 0.15s',
            } as React.CSSProperties}
            onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
            onMouseLeave={e => (e.currentTarget.style.color = '#d0d0f0')}
          >
            {save.title || hostname(save.url)}
          </a>
        )}

        {/* ── AI SUMMARY ── */}
        {save.summary ? (
          <div style={{
            background:'rgba(99,102,241,0.04)',
            border:'1px solid rgba(99,102,241,0.08)',
            borderRadius:8, padding:'9px 11px', marginBottom:12,
          }}>
            <p style={{
              fontSize:9, color:'#4a4a6a', fontFamily:"'DM Mono',monospace",
              letterSpacing:'0.1em', marginBottom:5,
            }}>AI SUMMARY</p>
            <p style={{
              fontSize:12, color:'#5858a8', lineHeight:1.7,
              display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical',
              overflow:'hidden',
            } as React.CSSProperties}>
              {save.summary}
            </p>
          </div>
        ) : save.status === 'pending' ? (
          <div style={{
            background:'rgba(99,102,241,0.03)',
            border:'1px solid rgba(99,102,241,0.07)',
            borderRadius:8, padding:'9px 11px', marginBottom:12,
            display:'flex', alignItems:'center', gap:8,
          }}>
            <div style={{width:5, height:5, borderRadius:'50%', background:'#6366f1', flexShrink:0, animation:'pulse 1.3s ease-in-out infinite'}} />
            <p style={{fontSize:11, color:'#3a3a5a', fontStyle:'italic'}}>AI is reading this…</p>
          </div>
        ) : null}

        {/* ── TAGS ── */}
        {save.tags && save.tags.length > 0 && (
          <div style={{display:'flex', gap:5, flexWrap:'wrap', marginBottom:12}}>
            {save.tags.map(tag => (
              <button
                key={tag}
                className={`tag-btn${activeTag === tag ? ' active' : ''}`}
                onClick={() => onTagClick(tag)}
              >#{tag}</button>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div style={{flex:1}} />

        {/* ── ACTIONS ── */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.04)', marginTop:4,
        }}>
          <button
            onClick={() => onReadToggle(save)}
            className="action-btn"
            style={{
              background: save.isRead ? 'rgba(99,102,241,0.1)' : 'transparent',
              borderColor: save.isRead ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.07)',
              color: save.isRead ? '#8b8cf8' : '#4a4a6a',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement
              if (!save.isRead) { el.style.borderColor = 'rgba(255,255,255,0.14)'; el.style.color = '#7070a0' }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement
              if (!save.isRead) { el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.color = '#4a4a6a' }
            }}
          >
            {save.isRead ? '✓ READ' : 'UNREAD'}
          </button>

          <div className="card-actions" style={{display:'flex', gap:5}}>
            <a
              href={save.url} target="_blank" rel="noopener noreferrer"
              className="action-btn"
              style={{
                display:'inline-flex', alignItems:'center', gap:4,
                background:'rgba(99,102,241,0.08)',
                borderColor:'rgba(99,102,241,0.2)',
                color:'#8b8cf8', textDecoration:'none', fontWeight:500,
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(99,102,241,0.16)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(99,102,241,0.08)' }}
            >OPEN ↗</a>
            <button
              onClick={() => onDelete(save.id)}
              className="action-btn"
              style={{
                background:'transparent',
                borderColor:'rgba(255,255,255,0.07)',
                color:'#3a3a5a',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'rgba(239,68,68,0.1)'
                el.style.borderColor = 'rgba(239,68,68,0.2)'
                el.style.color = '#ef4444'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'transparent'
                el.style.borderColor = 'rgba(255,255,255,0.07)'
                el.style.color = '#3a3a5a'
              }}
            >×</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  )
}
