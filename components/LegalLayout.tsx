import Link from 'next/link'
import type { ReactNode } from 'react'

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div style={{minHeight:'100vh', background:'#ffffff', color:'#111', display:'flex', flexDirection:'column', fontFamily:'system-ui, sans-serif'}}>
      <header style={{borderBottom:'1px solid #e5e7eb', padding:'20px'}}>
        <div style={{maxWidth:'768px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Link href="/" style={{fontWeight:600, color:'#111', textDecoration:'none'}}>Sweet Social Space</Link>
          <Link href="/feed" style={{fontSize:14, color:'#666'}}>Feed →</Link>
        </div>
      </header>
      <main style={{maxWidth:'768px', margin:'0 auto', width:'100%', flex:1, padding:'48px 24px'}}>
        <h1 style={{fontSize:28, fontWeight:700, marginBottom:8, color:'#000'}}>{title}</h1>
        <p style={{fontSize:13, color:'#666', marginBottom:32}}>Last updated: {updated}</p>
        <div style={{lineHeight:1.7, fontSize:15, color:'#222'}}>{children}</div>
      </main>
      <footer style={{borderTop:'1px solid #e5e7eb', padding:'20px', textAlign:'center', fontSize:'12px', color:'#888'}}>
        © Sweet Social Space • GLOBAL • SSL SECURED • 
        <Link href="/legal/terms" style={{marginLeft:8}}>Terms</Link> • 
        <Link href="/legal/privacy" style={{marginLeft:8}}>Privacy</Link> • 
        <Link href="/legal/contact" style={{marginLeft:8}}>Contact</Link>
      </footer>
    </div>
  )
}
