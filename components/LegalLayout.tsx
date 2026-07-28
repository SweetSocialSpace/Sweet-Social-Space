import Link from 'next/link'
import type { ReactNode } from 'react'

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div style={{minHeight:'100vh', color:'#111', display:'flex', flexDirection:'column', fontFamily:'system-ui, sans-serif', position:'relative'}}>
      {/* GLOBAL BACKDROP - fixed behind everything - this was missing */}
      <div style={{
        position:'fixed',
        inset:0,
        zIndex:-1,
        background:'#f6f5f2',
        backgroundImage:'radial-gradient(at 50% 0%, #ffffff 0%, #f6f5f2 50%, #ece9e3 100%)'
      }} />

      <header style={{borderBottom:'1px solid #e5e7eb', padding:'20px', background:'rgba(255,255,255,0.8)', backdropFilter:'blur(8px)', position:'sticky', top:0, zIndex:10}}>
        <div style={{maxWidth:'768px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Link href="/" style={{fontWeight:700, color:'#111', textDecoration:'none'}}>Sweet Social Space • GLOBAL</Link>
          <Link href="/feed" style={{fontSize:14, color:'#666', textDecoration:'none'}}>Feed →</Link>
        </div>
      </header>
      
      <main style={{maxWidth:'768px', margin:'0 auto', width:'100%', flex:1, padding:'48px 24px'}}>
        <h1 style={{fontSize:32, fontWeight:800, marginBottom:8, color:'#000', letterSpacing:'-0.02em'}}>{title}</h1>
        <p style={{fontSize:13, color:'#666', marginBottom:32}}>Last updated: {updated}</p>
        <div style={{lineHeight:1.8, fontSize:15, color:'#222'}}>{children}</div>
      </main>
      
      <footer style={{borderTop:'1px solid #e5e7eb', padding:'20px', textAlign:'center', fontSize:'12px', color:'#888', background:'rgba(255,255,255,0.6)'}}>
        © Sweet Social Space • GLOBAL • SSL SECURED • 
        <Link href="/legal/terms" style={{marginLeft:8, color:'#666'}}>Terms of Service</Link> • 
        <Link href="/legal/privacy" style={{marginLeft:8, color:'#666'}}>Privacy</Link> • 
        <Link href="/legal/contact" style={{marginLeft:8, color:'#666'}}>Contact</Link>
      </footer>
    </div>
  )
}
