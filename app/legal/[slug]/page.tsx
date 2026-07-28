import { LegalLayout } from '@/components/LegalLayout'

const PAGES: Record<string, { title: string; updated: string; content: React.ReactNode }> = {
  // 1. TERMS - keep slug "terms" - title "Terms of Service"
  terms: {
    title: 'Terms of Service',
    updated: 'July 27, 2026',
    content: (
      <>
        <p><strong>Welcome to Sweet Social Space. By using sweetsocialspace.com you agree to these Terms of Service.</strong></p>
        <h2>1. What We Are</h2><p>Hyperlocal private network - your block within 10 miles of YOU GLOBAL. Neighbors share couches, jobs, alerts.</p>
        <h2>2. Eligibility</h2><p>13+ (16+ EU). One account. Zip for proximity. IP via ipapi.co/json first, profile second, GLOBAL failsafe third. Supabase RLS.</p>
        <h2>3. Your Content</h2><p>You own it. License to display to neighbors ~10 miles. Delete anytime.</p>
        <h2>4. Rules</h2><p>Speak Freely Love Neighbor. No harassment, no illegal, no spam bots - NO ROBOTS. No shadowbans for faith ✝.</p>
        <h2>5. Privacy</h2><p>Minimal: email, zip, city. No selling. No Pixel. Private 10 miles.</p>
        <h2>6. Verified Sources</h2><p>Fire Station 3, 63, WeatherBar LIVE, Latest Alerts GLOBAL.</p>
        <h2>7. DMCA</h2><p>legal@sweetsocialspace.com</p>
        <h2>8. Contact</h2><p>support@sweetsocialspace.com • verification@sweetsocialspace.com</p>
      </>
    )
  },
  // 2. PRIVACY
  privacy: {
    title: 'Privacy Policy',
    updated: 'July 27, 2026',
    content: (
      <>
        <h2>What We Collect</h2><p>Email, username, zip, city. IP via ipapi.co/json for GLOBAL detection only </p>
        <h2>What We Don't</h2><p>No selling data. No Facebook Pixel. No tracking. Row Level Security Supabase encrypted at rest.</p>
        <h2>Use</h2><p>To show neighbors within 10 miles of YOU wherever you are GLOBAL. Chronological by zip_code.</p>
        <h2>Your Rights</h2><p>Access, correct, delete via Profile. privacy@sweetsocialspace.com</p>
      </>
    )
  },
  // 3. SECURITY
  security: {
    title: 'Security • SSL Secured',
    updated: 'July 27, 2026',
    content: (
      <>
        <h2>SSL Secured</h2><p>https://sweetsocialspace.com only. TLS 1.3 via Vercel. Padlock in address bar.</p>
        <h2>Auth</h2><p>Supabase Auth RLS - Row Level Security. Encrypted at rest. No bots.</p>
        <h2>Report</h2><p>security@sweetsocialspace.com</p>
      </>
    )
  },
  // 4. VERIFICATION
  verification: {
    title: 'Verification • GLOBAL',
    updated: 'July 27, 2026',
    content: (
      <>
        <h2>1. SSL Secured</h2><p>Check padlock: https://sweetsocialspace.com • TLS 1.3 • Vercel</p>
        <h2>2. Domain</h2><p>Official domain sweetsocialspace.com only. DNS Vercel. Washington DC iad1.</p>
        <h2>3. GLOBAL Test</h2><p>Incognito /feed shows GLOBAL not hardwired. IP ipapi.co/json first, profile second, GLOBAL failsafe third.</p>
        <h2>4. Verified Sources</h2><p>Verified Sources • Near GLOBAL - Fire Station 3, 63 - verified fire_station. Events LIVE from GLOBAL.</p>
        <h2>5. Privacy</h2><p>Private to 10 miles of YOU wherever you are in world. No tracking. RLS.</p>
        <h2>6. Independent</h2><p>No Big Tech. No robots. Speak Freely. Love Neighbor.</p>
      </>
    )
  },
  // 5. GUARANTEES (covers both guarantee and guarantees folders)
  guarantees: {
    title: 'Our Guarantees • GLOBAL',
    updated: 'July 27, 2026',
    content: (
      <>
        <h2>1. YOUR BLOCK FIRST</h2><p>Private to neighbors within 10 miles of YOU GLOBAL.</p>
        <h2>2. NO SHADOWBANS FOR FAITH</h2><p>SPEAK FREELY. LOVE YOUR NEIGHBOR.</p>
        <h2>3. NO ROBOTS, NO BOTS</h2><p>No robots deciding feed. Chronological by zip_code.</p>
        <h2>4. GLOBAL DETECTION</h2><p>IP detection ipapi.co/json first - GLOBAL </p>
        <h2>5. VERIFIED SOURCES LIVE</h2><p>Latest Alerts GLOBAL, WeatherBar, Verified Sources Fire Station 3, 63.</p>
        <h2>6. SSL SECURED & PRIVATE</h2><p>Full SSL/TLS Vercel, Supabase Auth RLS.</p>
        <h2>7. INDEPENDENT FAILSAFE</h2><p>Independent not Big Tech. Vertebrae independent.</p>
      </>
    )
  },
  // 6. ABOUT
  about: {
    title: 'About • GLOBAL',
    updated: 'July 27, 2026',
    content: <p>Sweet Social Space - Your block not the world. 10 miles of YOU wherever you are GLOBAL. Speak Freely. Love Your Neighbor. Independent. No Big Tech owner. No robots.</p>
  },
  // 7. CONTACT
  contact: {
    title: 'Contact Us',
    updated: 'July 27, 2026',
    content: <p>Support: support@sweetsocialspace.com • Verification: verification@sweetsocialspace.com • Legal: legal@sweetsocialspace.com • Security: security@sweetsocialspace.com</p>
  },
  // 8. LEGAL
  legal: {
    title: 'Legal • GLOBAL',
    updated: 'July 27, 2026',
    content: <p>DMCA: legal@sweetsocialspace.com. Governing Law California Santa Clara County. GLOBAL LIVE VERTEBRAE FAILSAFE. SSL SECURED. Independent.</p>
  },
}

// Aliases for your 8 folders - so /legal/Terms, /legal/Guarantee etc all work
const ALIASES: Record<string,string> = {
  guarantee: 'guarantees',
  term: 'terms',
  termsofservice: 'terms',
  'terms-of-service': 'terms',
}

export default function LegalSlugPage({ params }: { params: { slug: string } }) {
  const raw = (params.slug || 'legal').toLowerCase().replace(/\s+/g,'')
  const key = ALIASES[raw] || raw
  const page = PAGES[key] || PAGES['legal']
  return <LegalLayout title={page.title} updated={page.updated}>{page.content}</LegalLayout>
}
