import Link from 'next/link'

const PAGES: any = {
  terms: {
    title: 'Terms of Use • GLOBAL',
    body: `Sweet Social Space is private to neighbors within 10 miles of YOU — wherever you are in the world. GLOBAL • LIVE • VERTEBRAE • INDEPENDENT. By using the platform you agree to love your neighbor, speak freely, no bots, no spam, no harassment. We are independent, no shadowbans for your faith. Violations removed.`
  },
  privacy: {
    title: 'Privacy Policy • GLOBAL',
    body: `We collect only what you give: zip/postal, city, email. We use IP geolocation to detect your block — GLOBAL detection, never hardwired. Your zip stays in your profile only. We never sell data. We never share your exact address. Posts are visible only within 10 miles of you. SSL Secured • Encrypted at rest.`
  },
  verification: {
    title: 'Verification • How We Verify • GLOBAL',
    body: `How to verify this is secured: 1) Check URL: https://sweetsocialspace.com — SSL padlock. 2) Check footer: GLOBAL • VERTEBRAE • FAILSAFE. 3) Verified Sources panel shows Alameda Fire, etc — verified fire_station. 4) Incognito test: open incognito /feed shows GLOBAL, not a hardwired zip. 5) Signup demands your block — GLOBAL demands, not defaults.`
  },
  contact: {
    title: 'Contact • GLOBAL • LIVE',
    body: `Contact us: support@sweetsocialspace.com • Response within 24 hours • GLOBAL • LIVE. Report abuse via flag on any post. For verification or press: verification@sweetsocialspace.com`
  },
  security: {
    title: 'Security • SSL Secured • GLOBAL',
    body: `Secured site: Full SSL/TLS, Supabase Auth, Row Level Security, 10-mile radius privacy, no robots deciding what you see. All traffic https. Passwords hashed. No plaintext. GLOBAL • VERTEBRAE • FAILSAFE • INDEPENDENT.`
  },
  guarantees: {
    title: 'Our Guarantees • GLOBAL',
    body: `Guarantees: 1) No shadowbans for faith. 2) Your block first, not the world. 3) No bots. 4) Private to 10 miles of you. 5) Independent — not owned by Big Tech. 6) Speak Freely. Love Your Neighbor. GLOBAL • LIVE.`
  },
  legal: {
    title: 'Legal • DMCA • GLOBAL',
    body: `Legal: DMCA contact legal@sweetsocialspace.com. We comply with US law. Content owned by poster. Platform is independent. GLOBAL • VERTEBRAE • FAILSAFE. © 2026 Sweet Social Space.`
  }
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const data = PAGES[params.slug] || PAGES['terms']
  return (
    <div className="min-h-screen w-full bg-black text-white p-10 pt-20">
      <Link href="/" className="text-white/50 text-sm uppercase tracking-widest">← Home • GLOBAL</Link>
      <h1 className="text-5xl font-black mt-6">{data.title}</h1>
      <p className="mt-8 text-lg text-white/70 max-w-3xl leading-relaxed whitespace-pre-line">{data.body}</p>
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
        {Object.keys(PAGES).map(k => (
          <Link key={k} href={`/legal/${k}`} className={`p-3 rounded-xl border text-center font-bold uppercase text-xs tracking-widest ${params.slug===k ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}>{k}</Link>
        ))}
      </div>
      <p className="mt-12 text-white/20 text-xs uppercase tracking-widest">GLOBAL • VERTEBRAE • FAILSAFE • SSL SECURED • INDEPENDENT</p>
    </div>
  )
}

