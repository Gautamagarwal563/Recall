'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mouse, setMouse] = useState({ x: -999, y: -999 })
  const cardRef = useRef<HTMLDivElement>(null)

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
    if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return }
    router.push(tab === 'signup' ? '/onboarding' : '/dashboard')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; font-family: 'DM Sans', sans-serif; overflow: hidden; height: 100vh; }

        @keyframes aurora {
          0%,100% { transform: translate(0,0) scale(1) rotate(0deg); }
          33%      { transform: translate(40px,-30px) scale(1.08) rotate(4deg); }
          66%      { transform: translate(-20px,20px) scale(0.94) rotate(-3deg); }
        }
        @keyframes gridPulse { 0%,100%{opacity:0.25} 50%{opacity:0.45} }
        @keyframes gradientRotate {
          0%  { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100%{ background-position: 0% 50%; }
        }
        @keyframes btnShine {
          0%{left:-80%} 60%,100%{left:120%}
        }

        .auth-input {
          width: 100%; padding: 14px 16px 14px 44px;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 13px; color: #e8e8f8;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 300;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; outline: none;
        }
        .auth-input:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.08);
          background: rgba(99,102,241,0.04);
        }
        .auth-input::placeholder { color: #2a2a4a; }
        .auth-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 40px #12121e inset !important;
          -webkit-text-fill-color: #e8e8f8 !important;
        }

        .submit-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a78bfa 70%, #6366f1 100%);
          background-size: 250% 250%;
          animation: gradientRotate 5s ease infinite;
          color: #fff; border: none;
          border-radius: 13px; font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 24px rgba(99,102,241,0.45);
          transition: transform 0.15s, box-shadow 0.15s;
          position: relative; overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.6);
        }
        .submit-btn::after {
          content:''; position:absolute; top:0; left:-80%; width:50%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
          animation: btnShine 3.5s ease-in-out infinite; pointer-events:none;
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; animation: none; }

        .input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 14px; color: #3a3a5a; pointer-events: none;
          transition: color 0.2s;
        }
        .input-wrap:focus-within .input-icon { color: #6366f1; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#080810',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.2) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
          animation: 'gridPulse 8s ease-in-out infinite',
        }} />

        {/* Aurora blobs */}
        <div style={{ position:'absolute', width:600, height:440, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 65%)', top:'-5%', left:'50%', transform:'translateX(-50%)', filter:'blur(60px)', pointerEvents:'none', animation:'aurora 18s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.16) 0%,transparent 65%)', bottom:'15%', right:'10%', filter:'blur(45px)', pointerEvents:'none', animation:'aurora 22s ease-in-out infinite reverse' }} />
        <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(236,72,153,0.1) 0%,transparent 65%)', bottom:'20%', left:'8%', filter:'blur(40px)', pointerEvents:'none', animation:'aurora 28s ease-in-out infinite 3s' }} />

        <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:420 }}>

          {/* Back */}
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
            <Link href="/" style={{
              display:'inline-flex', alignItems:'center', gap:6, marginBottom:28,
              fontSize:11, color:'#3a3a5a', textDecoration:'none',
              fontFamily:"'DM Mono',monospace", letterSpacing:'0.1em',
              transition:'color 0.15s',
            }}
              onMouseEnter={e=>((e.currentTarget as HTMLAnchorElement).style.color='#8080a0')}
              onMouseLeave={e=>((e.currentTarget as HTMLAnchorElement).style.color='#3a3a5a')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" style={{width:16,height:16,mixBlendMode:'screen'}} />
              ← REKAWL
            </Link>
          </motion.div>

          {/* Card */}
          <motion.div
            ref={cardRef}
            initial={{opacity:0, y:20, scale:0.97}}
            animate={{opacity:1, y:0, scale:1}}
            transition={{duration:0.65, ease:[0.22,1,0.36,1]}}
            onMouseMove={e=>{
              const rect = cardRef.current?.getBoundingClientRect()
              if(rect) setMouse({x:e.clientX-rect.left, y:e.clientY-rect.top})
            }}
            onMouseLeave={()=>setMouse({x:-999,y:-999})}
            style={{
              background:'rgba(14,14,26,0.85)', backdropFilter:'blur(24px)',
              borderRadius:22, padding:'36px 32px',
              border:'1px solid rgba(255,255,255,0.07)',
              boxShadow:'0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.06)',
              position:'relative', overflow:'hidden',
            }}
          >
            {/* Card spotlight */}
            <div style={{
              position:'absolute', inset:0, pointerEvents:'none', borderRadius:22,
              background:`radial-gradient(400px circle at ${mouse.x}px ${mouse.y}px, rgba(99,102,241,0.1), transparent 50%)`,
            }} />

            {/* Top gradient line */}
            <div style={{
              position:'absolute', top:0, left:'10%', right:'10%', height:1,
              background:'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
            }} />

            <div style={{position:'relative', zIndex:1}}>
              {/* Header */}
              <div style={{marginBottom:28}}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{opacity:0, y:8}}
                    animate={{opacity:1, y:0}}
                    exit={{opacity:0, y:-8}}
                    transition={{duration:0.25}}
                  >
                    <h2 style={{
                      fontFamily:"'Instrument Serif',serif",
                      fontSize:30, color:'#f2f2fa', fontWeight:400, marginBottom:6,
                      letterSpacing:'-0.01em',
                    }}>
                      {tab==='login' ? 'Welcome back.' : 'Create account.'}
                    </h2>
                    <p style={{fontSize:14, color:'#4a4a6a', fontWeight:300}}>
                      {tab==='login' ? 'Sign in to your Rekawl library.' : 'Free to start — no card needed.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Tabs */}
              <div style={{
                display:'flex', gap:3, background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.06)',
                borderRadius:14, padding:3, marginBottom:28, position:'relative',
              }}>
                {(['login','signup'] as const).map(t=>(
                  <button key={t}
                    onClick={()=>{setTab(t);setError('')}}
                    style={{
                      flex:1, padding:'9px', border:'none', borderRadius:11,
                      fontFamily:"'DM Sans',sans-serif", fontSize:14, cursor:'pointer',
                      position:'relative', zIndex:1, transition:'color 0.2s',
                      background: tab===t
                        ? 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.2))'
                        : 'transparent',
                      color: tab===t ? '#c4c6ff' : '#3a3a5a',
                      fontWeight: tab===t ? 500 : 400,
                      boxShadow: tab===t ? '0 2px 8px rgba(99,102,241,0.15), inset 0 0 0 1px rgba(99,102,241,0.2)' : 'none',
                    }}
                  >
                    {t==='login' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:14}}>
                <div>
                  <label style={{display:'block', marginBottom:8, fontFamily:"'DM Mono',monospace", fontSize:10, color:'#3a3a5a', letterSpacing:'0.14em'}}>EMAIL</label>
                  <div className="input-wrap" style={{position:'relative'}}>
                    <span className="input-icon">✉</span>
                    <input className="auth-input" type="email" value={email}
                      onChange={e=>setEmail(e.target.value)}
                      placeholder="you@example.com" required />
                  </div>
                </div>

                <div>
                  <label style={{display:'block', marginBottom:8, fontFamily:"'DM Mono',monospace", fontSize:10, color:'#3a3a5a', letterSpacing:'0.14em'}}>PASSWORD</label>
                  <div className="input-wrap" style={{position:'relative'}}>
                    <span className="input-icon">⬡</span>
                    <input className="auth-input" type="password" value={password}
                      onChange={e=>setPassword(e.target.value)}
                      placeholder="••••••••" required />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{opacity:0, y:-6, scale:0.97}}
                      animate={{opacity:1, y:0, scale:1}}
                      exit={{opacity:0, scale:0.97}}
                      style={{
                        fontSize:13, color:'#f87171',
                        background:'rgba(248,113,113,0.07)',
                        border:'1px solid rgba(248,113,113,0.15)',
                        padding:'11px 14px', borderRadius:11,
                        fontFamily:"'DM Mono',monospace", letterSpacing:'0.02em',
                      }}
                    >{error}</motion.p>
                  )}
                </AnimatePresence>

                <button type="submit" className="submit-btn" disabled={loading} style={{marginTop:4}}>
                  {loading ? (
                    <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                      <span style={{width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',display:'inline-block',animation:'spin 0.6s linear infinite'}} />
                      one sec…
                    </span>
                  ) : tab==='login' ? 'Sign In →' : 'Create Account →'}
                </button>
              </form>

              {/* Footer */}
              <p style={{textAlign:'center', marginTop:20, fontSize:10, color:'#2a2a4a', fontFamily:"'DM Mono',monospace", letterSpacing:'0.1em'}}>
                FREE FOREVER · NO CREDIT CARD
              </p>

              <div style={{display:'flex', justifyContent:'center', gap:20, marginTop:16}}>
                {[['Privacy', '/privacy'], ['Support', '/support']].map(([label, href])=>(
                  <Link key={label} href={href} style={{fontSize:10, color:'#2a2a4a', textDecoration:'none', fontFamily:"'DM Mono',monospace", letterSpacing:'0.08em', transition:'color 0.15s'}}
                    onMouseEnter={e=>((e.currentTarget as HTMLAnchorElement).style.color='#5a5a7a')}
                    onMouseLeave={e=>((e.currentTarget as HTMLAnchorElement).style.color='#2a2a4a')}
                  >{label}</Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
