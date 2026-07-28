import Link from 'next/link'
import type { ReactNode } from 'react'
import { LegalFooter } from './LegalFooter'

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div style={{minHeight:'100vh', background:'#fff', color:'#111', display:'flex', flexDirection:'column', fontFamily:'system-ui, sans-serif'}}>
      <header style={{borderBottom:'1px solid #e5e7eb', padding:'20px'}}>
        <div style={{maxWidth:'768px', margin:'0 auto', display:'flex', justifyContent:'space-between'}}>
          <Link href="/" style={{fontWeight:700, color:'#111', textDecoration:'none'}}>Sweet Social Space</Link>
          <Link href="/feed" style={{fontSize:14, color:'#666'}}>Feed →</Link>
        </div>
      </header>
      <main style={{maxWidth:'768px', margin:'0 auto', width:'100%', flex:1, padding:'48px 24px'}}>
        <h1 style={{fontSize:28, fontWeight:700}}>{title}</h1>
        <p style={{fontSize:13, color:'#666', marginBottom:32}}>Last updated: {updated}</p>
        <div style={{lineHeight:1.7, fontSize:15, color:'#222'}}>{children}</div>
      </main>
      <LegalFooter />
    </div>
  )
}
