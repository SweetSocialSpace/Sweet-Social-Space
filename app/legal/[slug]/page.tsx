import React from 'react'
import { LegalLayout } from '@/components/LegalLayout'

type LegalContent = {
  title: string
  updated: string
  content: React.ReactNode
}

const PAGES: Record<string, LegalContent> = {
  terms: {
    title: 'Terms of Service',
    updated: 'July 27, 2026',
    content: (
      <div>
        <p><strong>Welcome to Sweet Social Space. By using sweetsocialspace.com you agree to these Terms of Service.</strong></p>
        <h2>1. What We Are</h2>
        <p>Hyperlocal private network - your block within 10 miles of YOU wherever you are GLOBAL.</p>
        <h2>2. Eligibility</h2>
        <p>13+ (16+ EU). One account. Zip for proximity. IP via ipapi.co/json first, profile second, GLOBAL failsafe third. Supabase RLS.</p>
        <h2>3. Your Content</h2>
        <p>You own it. License to display to neighbors within 10 miles. Delete anytime.</p>
        <h2>4. Rules</h2>
        <p>Speak Freely Love Neighbor. No harassment, no illegal, no spam bots. No shadowbans for faith.</p>
        <h2>5. Privacy</h2>
        <p>Minimal email zip city. No selling. No Pixel. Private 10 miles of YOU.</p>
        <h2>6. Contact</h2>
        <p>support@sweetsocialspace.com</p>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'July 27, 2026',
    content: (
      <div>
        <h2>What We Collect</h2><p>Email username zip city. IP via ipapi.co/json for GLOBAL detection only.</p>
        <h2>What We Do Not</h2><p>No selling. No Facebook Pixel. No tracking. Row Level Security.</p>
        <h2>Your Rights</h2><p>Access correct delete via Profile. privacy@sweetsocialspace.com</p>
      </div>
    ),
  },
  security: {
    title: 'Security',
    updated: 'July 27, 2026',
    content: <p>SSL Secured https only TLS 1.3 via Vercel. Supabase Auth RLS encrypted at rest. Report security@sweetsocialspace.com</p>,
  },
  verification: {
    title: 'Verification',
    updated: 'July 27, 2026',
    content: (
      <div>
        <p>1. SSL Secured - https://sweetsocialspace.com TLS 1.3 Vercel</p>
        <p>2. Domain - sweetsocialspace.com only DNS Vercel Washington DC iad1</p>
        <p>3. GLOBAL Test - Incognito /feed shows GLOBAL not hardwired IP ipapi.co/json first</p>
        <p>4. Verified Sources - Near GLOBAL Fire Station 3, 63 verified fire_station Events LIVE</p>
        <p>5. Privacy - Private 10 miles of YOU wherever you are No tracking RLS</p>
        <p>6. Independent - No Big Tech No robots Speak Freely Love Neighbor</p>
      </div>
    ),
  },
  guarantees: {
    title: 'Our Guarantees',
    updated: 'July 27, 2026',
    content: (
      <div>
        <p>1. YOUR BLOCK FIRST - Private within 10 miles of YOU GLOBAL</p>
        <p>2. NO SHADOWBANS FOR FAITH - SPEAK FREELY LOVE YOUR NEIGHBOR</p>
        <p>3. NO ROBOTS - Chronological by zip_code no bots</p>
        <p>4. GLOBAL DETECTION - IP ipapi.co/json first GLOBAL not hardwired</p>
        <p>5. VERIFIED SOURCES LIVE - Latest Alerts GLOBAL WeatherBar Fire Station 3, 63</p>
        <p>6. SSL SECURED - Full TLS Vercel RLS Supabase</p>
        <p>7. INDEPENDENT - Not Big Tech Vertebrae independent</p>
      </div>
    ),
  },
  about: {
    title: 'About',
    updated: 'July 27, 2026',
    content: <p>Your block not the world. 10 miles of YOU wherever you are GLOBAL. Independent No Big Tech Speak Freely Love Neighbor.</p>,
  },
  contact: {
    title: 'Contact Us',
    updated: 'July 27, 2026',
    content: <p>Support support@sweetsocialspace.com Verification verification@sweetsocialspace.com Legal legal@sweetsocialspace.com</p>,
  },
  legal: { title: 'Legal', updated: 'July 27, 2026', content: 
<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
<p><strong>DMCA / Copyright</strong><br/>If you believe content infringes your copyright, email legal@sweetsocialspace.com with: (1) description of work, (2) URL on site, (3) your contact, (4) good faith statement, (5) signature. We respond within 48 hours and remove verified infringement.</p>
<p><strong>Governing Law</strong><br/>California law, Santa Clara County venue, without regard to conflict of laws. Disputes resolved via binding arbitration in San Jose, CA unless prohibited.</p>
<p><strong>Contact</strong><br/>Legal: legal@sweetsocialspace.com<br/>Support: support@sweetsocialspace.com<br/>Security: security@sweetsocialspace.com</p>
<p><strong>Platform</strong><br/>Sweet Social Space • GLOBAL • SSL SECURED • IP detection via ipapi.co/json • Supabase RLS • Vercel iad1 • Independent - No Big Tech.</p>
</div> 
},
}

const ALIASES: Record<string, string> = {
  guarantee: 'guarantees',
  term: 'terms',
  termsofservice: 'terms',
}

export default function LegalSlugPage({ params }: { params: { slug: string } }) {
  const raw = params.slug.toLowerCase().replace(/[^a-z]/g, '')
  const key = ALIASES[raw] || raw
  const page = PAGES[key] || PAGES.legal
  return <LegalLayout title={page.title} updated={page.updated}>{page.content}</LegalLayout>
}
