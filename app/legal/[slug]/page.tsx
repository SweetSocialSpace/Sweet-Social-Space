import { LegalLayout } from '@/components/LegalLayout'

const PAGES: Record<string, { title: string; updated: string; content: React.ReactNode }> = {
  verification: {
    title: 'Verification • GLOBAL',
    updated: 'July 27, 2026',
    content: (
      <>
        <h2>1. SSL Secured</h2><p>Check padlock: https://sweetsocialspace.com • TLS 1.3 • Vercel • All traffic encrypted.</p>
        <h2>2. Domain Verification</h2><p>Official domain: sweetsocialspace.com only. DNS via Vercel. Washington DC - iad1.</p>
        <h2>3. GLOBAL Detection Test</h2><p>Open Incognito /feed — shows GLOBAL not hardwired. Signup demands Zip. IP via ipapi.co/json first, profile second, GLOBAL failsafe third.</p>
        <h2>4. Verified Sources</h2><p>Feed shows Verified Sources • Near GLOBAL — Fire Station 3, 63 — verified fire_station. Events LIVE from GLOBAL.</p>
        <h2>5. Privacy Guarantee</h2><p>Private to 10 miles of YOU — wherever you are in world. No tracking. Row Level Security.</p>
        <h2>6. Independent</h2><p>No Big Tech owner. No robots. No shadowbans for faith. Speak Freely. Love Your Neighbor.</p>
      </>
    )
  },
  guarantees: {
    title: 'Our Guarantees • GLOBAL',
    updated: 'July 27, 2026',
    content: (
      <>
        <h2>1. YOUR BLOCK FIRST</h2><p>Private to neighbors within 10 miles of YOU — GLOBAL. Your neighbor has free couch, needs job.</p>
        <h2>2. NO SHADOWBANS FOR FAITH</h2><p>SPEAK FREELY. LOVE YOUR NEIGHBOR. Never shadowban for faith ✝.</p>
        <h2>3. NO ROBOTS, NO BOTS</h2><p>No robots deciding feed. Chronological by zip_code.</p>
        <h2>4. GLOBAL DETECTION, NEVER HARDWIRED</h2><p>IP detection first via ipapi.co/json — GLOBAL not 95122.</p>
        <h2>5. VERIFIED SOURCES LIVE</h2><p>Latest Alerts GLOBAL, WeatherBar, Verified Sources — Fire Station 3, 63.</p>
        <h2>6. SSL SECURED & PRIVATE</h2><p>Full SSL/TLS via Vercel, Supabase Auth RLS, encrypted at rest.</p>
        <h2>7. INDEPENDENT FAILSAFE</h2><p>Independent not Big Tech. Vertebrae independent not dependent. Failsafe ErrorBoundary.</p>
      </>
    )
  },
  security: { title: 'Security • SSL Secured', updated: 'July 27, 2026', content: <><p>All https only. TLS 1.3 via Vercel. Supabase Auth RLS. Encrypted at rest. IP via ipapi.co/json GLOBAL. No Pixel. Report security@sweetsocialspace.com</p></> },
  legal: { title: 'Legal • GLOBAL', updated: 'July 27, 2026', content: <><p>DMCA legal@sweetsocialspace.com. Collect zip, city, email only. Verified Sources Fire Station 3, 63. Independent. Governing Law California. GLOBAL LIVE VERTEBRAE FAILSAFE.</p></> },
  terms: { title: 'Terms of Service', updated: 'July 27, 2026', content: <><p>Speak Freely Love Neighbor. Private 10 miles GLOBAL. No bots spam. You own content. Support support@sweetsocialspace.com</p></> },
  privacy: { title: 'Privacy Policy', updated: 'July 27, 2026', content: <><p>We collect zip, city, email only. IP via ipapi.co/json GLOBAL never hardwired 95122. No selling data. No Pixel. RLS Supabase. privacy@sweetsocialspace.com</p></> },
  contact: { title: 'Contact Us', updated: 'July 27, 2026', content: <><p>Support support@sweetsocialspace.com • Verification verification@sweetsocialspace.com • Legal legal@sweetsocialspace.com • Security security@sweetsocialspace.com</p></> },
  about: { title: 'About • GLOBAL', updated: 'July 27, 2026', content: <><p>Your block not world. 10 miles of YOU wherever you are GLOBAL. Free couch, job, alert 3 houses down. No shadowbans faith ✝, no bots.</p></> }
}

export default function LegalSlugPage({ params }: { params: { slug: string } }) {
  const slug = params.slug?.toLowerCase() || 'legal'
  const page = PAGES[slug] || PAGES['legal']
  return <LegalLayout title={page.title} updated={page.updated}>{page.content}</LegalLayout>
}
