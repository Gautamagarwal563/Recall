'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

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
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function hostname(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
}

export default function Dashboard() {
  const router = useRouter()
  const [saves, setSaves] = useState<Save[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSaves = useCallback(async (q?: string, tag?: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (tag) params.set('tag', tag)

    const res = await fetch(`/api/saves?${params}`)
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setSaves(data.saves ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchSaves() }, [fetchSaves])

  // Poll every 5s if there are pending saves
  useEffect(() => {
    const hasPending = saves.some(s => s.status === 'pending')
    if (!hasPending) return
    const id = setTimeout(() => fetchSaves(search || undefined, activeTag || undefined), 5000)
    return () => clearTimeout(id)
  }, [saves, search, activeTag, fetchSaves])

  const handleSearch = (val: string) => {
    setSearch(val)
    setActiveTag(null)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => fetchSaves(val || undefined, undefined), 300)
  }

  const handleTagFilter = (tag: string) => {
    const next = activeTag === tag ? null : tag
    setActiveTag(next)
    setSearch('')
    fetchSaves(undefined, next ?? undefined)
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
  }

  const allTags = Array.from(new Set(saves.flatMap(s => s.tags ?? [])))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: 'DM Sans', sans-serif; }

        @keyframes pendingPulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.25; }
        }
        .pending-dot { animation: pendingPulse 1.4s ease-in-out infinite; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card { animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }

        .save-card {
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .save-card:hover {
          border-color: rgba(99,102,241,0.28) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
        }

        .del-btn { opacity: 0; transition: opacity 0.15s, background 0.15s; }
        .save-card:hover .del-btn { opacity: 1; }

        .tag-chip {
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .tag-chip:hover {
          background: rgba(99,102,241,0.2) !important;
          border-color: rgba(99,102,241,0.4) !important;
          color: #c7c8ff !important;
        }

        .search-input {
          width: 100%; padding: 8px 14px 8px 38px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: #e0e0f0;
          font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input:focus {
          border-color: rgba(99,102,241,0.4);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
        .search-input::placeholder { color: #4a4a6a; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222238; border-radius: 3px; }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #14141f 25%, #1e1e32 50%, #14141f 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>

        {/* ── Navbar ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          height: 60, display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 24px',
          background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 22, color: '#f2f2fa', flexShrink: 0,
            letterSpacing: '-0.01em',
          }}>
            Re<span style={{ color: '#6366f1', fontStyle: 'italic' }}>call</span>
          </div>

          <div style={{ flex: 1, maxWidth: 480, margin: '0 auto', position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: '#4a4a6a', fontSize: 16, pointerEvents: 'none',
            }}>⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search your saves…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          <div style={{
            marginLeft: 'auto', flexShrink: 0,
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            cursor: 'pointer',
          }} title="Account" />
        </nav>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 64px' }}>

          {/* ── Tag filters ── */}
          {allTags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {[null, ...allTags].map(tag => (
                <button
                  key={tag ?? '__all__'}
                  onClick={() => tag === null ? (setActiveTag(null), setSearch(''), fetchSaves()) : handleTagFilter(tag)}
                  style={{
                    padding: '5px 14px', borderRadius: 100,
                    border: '1px solid',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11, letterSpacing: '0.06em',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: (tag === null ? !activeTag : activeTag === tag) ? '#6366f1' : 'transparent',
                    borderColor: (tag === null ? !activeTag : activeTag === tag) ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    color: (tag === null ? !activeTag : activeTag === tag) ? '#fff' : '#5a5a7a',
                  }}
                >
                  {tag ?? 'ALL'}
                </button>
              ))}
            </div>
          )}

          {/* ── Stats ── */}
          {!loading && saves.length > 0 && (
            <p style={{
              fontSize: 11, color: '#3a3a5a', marginBottom: 18,
              fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
            }}>
              {saves.length} SAVE{saves.length !== 1 ? 'S' : ''}
              {activeTag ? ` · #${activeTag}` : ''}
              {search ? ` · "${search}"` : ''}
            </p>
          )}

          {/* ── Skeletons ── */}
          {loading && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 16,
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{
                  height: 200, borderRadius: 14,
                  animationDelay: `${i * 0.1}s`,
                }} />
              ))}
            </div>
          )}

          {/* ── Empty states ── */}
          {!loading && saves.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              {search || activeTag ? (
                <>
                  <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.3 }}>◎</div>
                  <h3 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 28, color: '#e0e0f0', fontWeight: 400, marginBottom: 10,
                  }}>Nothing found</h3>
                  <p style={{ fontSize: 14, color: '#5a5a7a' }}>
                    {search ? `No saves matching "${search}"` : `No saves tagged "${activeTag}"`}
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.2 }}>◈</div>
                  <h3 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 32, color: '#e0e0f0', fontWeight: 400, marginBottom: 10,
                  }}>Your saves will appear here</h3>
                  <p style={{ fontSize: 15, color: '#5a5a7a', marginBottom: 32, fontWeight: 300 }}>
                    Install the Chrome extension and save your first page
                  </p>
                  <div style={{
                    display: 'inline-block', padding: '12px 24px',
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: 12, color: '#8b8cf8', fontSize: 12,
                    fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em',
                  }}>
                    chrome://extensions → Developer mode → Load unpacked
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Save cards grid ── */}
          {!loading && saves.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 16,
            }}>
              {saves.map((save, i) => (
                <div
                  key={save.id}
                  className="save-card card"
                  style={{
                    background: '#14141f',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14, padding: 20,
                    animationDelay: `${i * 0.035}s`,
                    opacity: save.isRead ? 0.6 : 1,
                    transition: 'opacity 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    {save.faviconUrl && (
                      <img
                        src={save.faviconUrl} alt=""
                        width={18} height={18}
                        style={{ borderRadius: 4, flexShrink: 0, marginTop: 2, opacity: 0.8 }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a
                        href={save.url} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'block', fontSize: 14, fontWeight: 500,
                          color: '#e4e4f8', textDecoration: 'none',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          lineHeight: 1.4, transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#8b8cf8')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#e4e4f8')}
                      >
                        {save.title || save.url}
                      </a>
                      <span style={{
                        fontSize: 11, color: '#3a3a5a',
                        fontFamily: "'DM Mono', monospace",
                      }}>
                        {hostname(save.url)}
                      </span>
                    </div>

                    {/* Status badge */}
                    {save.status === 'pending' && (
                      <div className="pending-dot" style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#6366f1', flexShrink: 0, marginTop: 5,
                      }} />
                    )}
                    {save.status === 'failed' && (
                      <span style={{
                        fontSize: 10, fontFamily: "'DM Mono', monospace",
                        color: '#ef4444', padding: '2px 6px',
                        background: 'rgba(239,68,68,0.1)', borderRadius: 4,
                        flexShrink: 0, marginTop: 2,
                      }}>FAIL</span>
                    )}
                  </div>

                  {/* Summary */}
                  {save.summary ? (
                    <p style={{
                      fontSize: 13, color: '#6060a0', lineHeight: 1.65,
                      marginBottom: 12,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>{save.summary}</p>
                  ) : save.status === 'pending' ? (
                    <p style={{
                      fontSize: 13, color: '#3a3a5a', fontStyle: 'italic',
                      lineHeight: 1.6, marginBottom: 12,
                    }}>AI is analyzing this page…</p>
                  ) : null}

                  {/* Tags */}
                  {save.tags && save.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {save.tags.map(tag => (
                        <button
                          key={tag}
                          className="tag-chip"
                          onClick={() => handleTagFilter(tag)}
                          style={{
                            padding: '3px 10px', borderRadius: 100,
                            border: '1px solid rgba(99,102,241,0.2)',
                            background: 'rgba(99,102,241,0.08)',
                            color: '#8b8cf8', fontSize: 11,
                            fontFamily: "'DM Mono', monospace",
                            cursor: 'pointer',
                          }}
                        >{tag}</button>
                      ))}
                    </div>
                  )}

                  {/* Bottom row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 11, color: '#3a3a5a',
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {timeAgo(save.createdAt)}
                    </span>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleReadToggle(save)}
                        title={save.isRead ? 'Mark unread' : 'Mark as read'}
                        style={{
                          padding: '5px 10px', borderRadius: 8,
                          border: '1px solid',
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10, letterSpacing: '0.06em', cursor: 'pointer',
                          transition: 'all 0.15s',
                          background: save.isRead ? 'rgba(99,102,241,0.15)' : 'transparent',
                          borderColor: save.isRead ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
                          color: save.isRead ? '#8b8cf8' : '#4a4a6a',
                        }}
                      >
                        {save.isRead ? '✓ READ' : 'UNREAD'}
                      </button>

                      <button
                        className="del-btn"
                        onClick={() => handleDelete(save.id)}
                        title="Delete"
                        style={{
                          padding: '5px 9px', borderRadius: 8,
                          border: '1px solid rgba(239,68,68,0.2)',
                          background: 'rgba(239,68,68,0.06)',
                          color: '#ef4444', fontSize: 14, cursor: 'pointer',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.16)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                      >×</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
