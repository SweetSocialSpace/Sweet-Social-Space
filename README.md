# Sweet Social Space
Neighborhood-first community platform – own your code, own your speech.
Built for global - any zip on earth.

Live: sweetsocialspace.com / feed

## What's in this house
- Neighborhood Feed – chronological, by zip/radius – global, works for any zip
- BlockMap – leaflet + overpass, auto-loads by zip
- LivePulse + AI Mayor – automated weather + pulse, by zip
- Speak Freely / Vent Wall – anonymous-optional
- Faith Corner – prayer requests & encouragement
- GoLive Voice – ElevenLabs mic, independent rib
- OwnThisBlock – Stripe
- Supabase Auth (email), Postgres, Storage
- Next.js 14 + Tailwind – fully yours, no hard-coded geography

## House Rules (Every file must pass)
1. No hard-coded zip/city/state/country/$ - use zip from profile || 'YOUR BLOCK'
2. No browser name checks
3. No device exclusion
4. No folder sharing - each component independent, only supabase + useLocation
5. House never dies - try/catch, fallback UI, no crash
6. Automated where called - Live means auto-fetch on zip, auto-interval
7. Global language

## 1. Database
1. supabase.com → open sweet-social-space project
2. SQL Editor → New query
3. Copy ALL of `supabase/schema.sql`, Run
4. Success - 4 tables created

## 2. API Keys
Supabase → Project Settings → API
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- Add to .env.local + Vercel env

Other APIs (global):
- NEXT_PUBLIC_OPENWEATHER_KEY - weather by zip, any country
- ELEVENLABS_API_KEY - voice

## 3. Run locally
npm install
cp .env.local.example .env.local
# paste keys
npm run dev
http://localhost:3000

## 4. Push to GitHub
git add .
git commit -m "Global house - independent ribs"
git push origin main

## 5. Deploy to Vercel
vercel.com → Import repo
Add Env Vars (all 4 keys)
Deploy
Domains → Add sweetsocialspace.com

## Automation
- `/api/alerts/ingest` → Vercel Cron Every 15 min – ingests by zip, global
- `/api/weather?zip=` – auto weather for any zip
- `/api/pulse?zip=` – auto pulse count

You own everything. No platform lock-in. Works for any neighborhood on earth.
