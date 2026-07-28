import Link from 'next/link'
import type { ReactNode } from 'react'

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'system-ui, sans-serif', position:'relative'}}>
      
      {/* YOUR GOLDEN DROPLET BACKDROP - on all 8 legal pages */}
      <div style={{
        position:'fixed',
        inset:0,
        zIndex:-2,
        backgroundImage: "url('/golden_droplet_heart_wallpaper.jpg')",
        backgroundSize:'cover',
        backgroundPosition:'center',
        backgroundAttachment:'fixed'
      }} />
      {/* Soft white veil so text readable over golden */}
      <div style={{
        position:'fixed',
        inset:0,
        zIndex:-1,
        background:'rgba(255,255,255,0.82)',
        backdropFilter:'blur(2px)'
      }} />

      <header style={{borderBottom:'1px solid rgba(0,0,0,0.08)', padding:'20px', background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', position:'sticky', top:0, zIndex:10}}>
        <div style={{maxWidth:'768px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Link href="/" style={{fontWeight:700, color:'#111', textDecoration:'none'}}>Sweet Social Space • GLOBAL</Link>
          <Link href="/feed" style={{fontSize:14, color:'#555', textDecoration:'none'}}>Feed →</Link>
        </div>
      </header>
      
      <main style={{maxWidth:'768px', margin:'0 auto', width:'100%', flex:1, padding:'48px 24px'}}>
        <h1 style={{fontSize:32, fontWeight:800, marginBottom:8, color:'#000'}}>{title}</h1>
        <p style={{fontSize:13, color:'#666', marginBottom:32}}>Last updated: {updated}</p>
        <div style={{lineHeight:1.8, fontSize:15, color:'#222', background:'rgba(255,255,255,0.9)', padding:'24px', borderRadius:'12px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>{children}</div>
      </main>
      
      <footer style={{borderTop:'1px solid rgba(0,0,0,0.08)', padding:'20px', textAlign:'center', fontSize:'12px', color:'#666', background:'rgba(255,255,255,0.85)'}}>
        © Sweet Social Space • GLOBAL • SSL SECURED • 
        <Link href="/legal/terms" style={{marginLeft:8, color:'#555'}}>Terms of Service</Link> • 
        <Link href="/legal/privacy" style={{marginLeft:8, color:'#555'}}>Privacy</Link> • 
        <Link href="/legal/contact" style={{marginLeft:8, color:'#555'}}>Contact</Link>
      </footer>
    </div>
  )
}
