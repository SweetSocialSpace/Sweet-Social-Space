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
      <div className="space-y-6">
        <p className="font-semibold">Welcome to Sweet Social Space. By using sweetsocialspace.com you agree to these Terms of Service.</p>

        <section><h2 className="text-xl font-bold">1. What We Are</h2><p>Hyperlocal private network - your block within 10 miles of YOU wherever you are in the world - GLOBAL.</p></section>
        <section><h2 className="text-xl font-bold">2. Eligibility</h2><p>13+ (16+ EU). One account per person. Zip for proximity. Location via IP first, profile second, GLOBAL failsafe third. Supabase RLS.</p></section>
        <section><h2 className="text-xl font-bold">3. Your Content - You Own It</h2><p>You own what you post. License to display to neighbors within 10 miles to operate service. Delete anytime.</p></section>
        <section><h2 className="text-xl font-bold">4. Community Rules</h2><p>Speak Freely. Love Your Neighbor. No harassment, no illegal, no spam bots - NO ROBOTS. No shadowbans for faith.</p></section>
        <section><h2 className="text-xl font-bold">5. Privacy</h2><p>Minimal: email, zip, city. No selling. No Pixel. Private 10 miles of YOU. See Privacy Policy.</p></section>
        <section><h2 className="text-xl font-bold">6. Contact</h2><p>support@sweetsocialspace.com - legal@sweetsocialspace.com - verification@sweetsocialspace.com</p></section>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'July 27, 2026',
    content: (
      <div className="space-y-6">
        <section><h2 className="text-xl font-bold">What We Collect</h2><p>Email, username, zip, city. IP via ipapi.co/json for GLOBAL detection only - never hardwired.</p></section>
        <section><h2 className="text-xl font-bold">What We Do Not</h2><p>No selling data. No Facebook Pixel. No tracking. Row Level Security encrypted.</p></section>
        <section><h2 className="text-xl font-bold">Your Rights</h2><p>Access, correct, delete via Profile. Contact privacy@sweetsocialspace.com</p></section>
      </div>
    ),
  },
  security: {
    title: 'Security',
    updated: 'July 27, 2026',
    content: <p>SSL Secured - https only, TLS 1.3 via Vercel. Supabase Auth RLS encrypted at rest. Report security@sweetsocialspace.com</p>,
  },
  verification: {
    title: 'Verification',
    updated: 'July 27, 2026',
    content: (
      <div className="space-y-4">
        <p><strong>1. SSL Secured:</strong> https://sweetsocialspace.com - TLS 1.3 - Vercel</p>
        <p><strong>2. Domain:</strong> sweetsocialspace.com only - DNS Vercel - Washington DC iad1</p>
        <p><strong>3. GLOBAL Test:</strong> Incognito /feed shows GLOBAL not hardwired - IP ipapi.co/json first</p>
        <p><strong>4. Verified Sources:</strong> Near GLOBAL - Fire Station 3, 63 - verified fire_station - Events LIVE</p>
        <p><strong>5. Privacy:</strong> Private 10 miles of YOU wherever you are - No tracking - RLS</p>
        <p><strong>6. Independent:</strong> No Big Tech - No robots - Speak Freely Love Neighbor</p>
      </div>
    ),
  },
  guarantees: {
    title: 'Our Guarantees',
    updated: 'July 27, 2026',
    content: (
      <div className="space-y-4">
        <p><strong>1. YOUR BLOCK FIRST:</strong> Private within 10 miles of YOU - GLOBAL</p>
        <p><strong>2. NO SHADOWBANS FOR FAITH:</strong> SPEAK FREELY LOVE YOUR NEIGHBOR</p>
        <p><strong>3. NO ROBOTS:</strong> Chronological by zip_code - no bots deciding feed</p>
        <p><strong>4. GLOBAL DETECTION:</strong> IP ipapi.co/json first - GLOBAL not hardwired</p>
        <p><strong>5. VERIFIED SOURCES LIVE:</strong> Latest Alerts GLOBAL, WeatherBar, Fire Station 3, 63</p>
        <p><strong>6. SSL SECURED:</strong> Full TLS Vercel, RLS Supabase</p>
        <p><strong>7. INDEPENDENT:</strong> Not Big Tech - Vertebrae independent</p>
      </div>
    ),
  },
  about: {
    title: 'About',
    updated: 'July 27, 2026',
    content: <p>Your block not the world. 10 miles of YOU wherever you are GLOBAL. Independent - No Big Tech - Speak Freely Love Neighbor.</p>,
  },
  contact: {
    title: 'Contact Us',
    updated: 'July 27, 2026',
    content: <p>Support: support@sweetsocialspace.com - Verification: verification@sweetsocialspace.com - Legal: legal@sweetsocialspace.com</p>,
  },
  legal: {
    title: 'Legal',
    updated: 'July 27, 2026',
    content: <p>DMCA: legal@sweetsocialspace.com - Governing Law California Santa Clara County - GLOBAL LIVE VERTEBRAE FAILSAFE.</p>,
  },
}

const ALIASES: Record<string, string> = {
  guarantee: 'guarantees',
  term: 'terms',
  termsofservice: 'terms',
}

export default function LegalSlugPage({ params }: { params: { slug: string } }) {
  const raw = (params.slug || 'legal').toLowerCase().replace(/[^a-z]/g, '')
  const key = ALIASES[raw] || raw
  const page = PAGES[key] || PAGES.legal

  return <LegalLayout title={page.title} updated={page.updated}>{page.content}</LegalLayout>
}
