# Sweet Social Space

Neighborhood-first community platform – own your code, own your speech.
Works anywhere - any zip on earth.

Built for Harry S Sweet – sweetsocialspace.com
Live: sweetsocialspace.com / feed

## What's in this house
- Neighborhood Feed – chronological, by zip/radius – works for any zip
- BlockMap – leaflet + overpass, auto-loads by zip
- LivePulse + AI Mayor – automated weather + pulse, by zip
- Speak Freely / Vent Wall – anonymous-optional
- Faith Corner – prayer requests & encouragement
- Local Alerts – automated ingestor slot for closures/fires/theft
- Supabase Auth (email magic link), Postgres, Storage
- Next.js 14 + Tailwind, fully yours
- GoLive Voice – ElevenLabs mic, independent rib
- OwnThisBlock – Stripe

## House Rules (Every file must pass)
1. No hard-coded zip/city/state/country/$ - use zip from profile || 'YOUR BLOCK'
2. No browser name checks
3. No device exclusion
4. No folder sharing - each component independent, only supabase + useLocation
5. House never dies - try/catch, fallback UI, no crash
6. Automated where called - Live means auto-fetch on zip, auto-interval
7. Universal language - works for any neighborhood on earth

## 1. Database
1. supabase.com → open sweet-social-space project
2. SQL Editor → New query
3. Copy ALL of `supabase/schema.sql`, Run
4. Success - tables created

## 2. API Keys
Supabase → Project Settings → API
Copy:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
Add to .env.local + Vercel env

Other APIs (universal):
- NEXT_PUBLIC_OPENWEATHER_KEY - weather by zip, any country
- ELEVENLABS_API_KEY - voice

## 3. Run locally
