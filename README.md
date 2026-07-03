# Sweet Social Space
Neighborhood-first community platform – own your code, own your speech.

Built for Harry S Sweet – sweetsocialspace.com

## What's in v1
- Neighborhood Feed – chronological, by zip/radius
- Speak Freely / Vent Wall – anonymous-optional vent posts
- Faith Corner – prayer requests & encouragement
- Local Alerts – automated ingestor slot for closures/fires/theft
- Supabase Auth (email magic link), Postgres, Storage
- Next.js 14 + Tailwind, fully yours

## 1. Create your database – DO THIS FIRST
1. Go to supabase.com → open your `sweet-social-space` project
2. Left sidebar → SQL Editor → New query
3. Open `supabase/schema.sql` in this repo, copy ALL of it, paste into Supabase, click Run
4. You should see: "Success. 4 tables created"

That's profiles, posts, comments, hearts.

## 2. Get your API keys
Supabase → Project Settings → API
Copy:
- Project URL → NEXT_PUBLIC_SUPABASE_URL
- anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY

## 3. Run locally
```
npm install
cp .env.local.example .env.local
# paste your two Supabase keys into .env.local
npm run dev
```
Open http://localhost:3000

## 4. Push to GitHub
1. github.com → New repository → Name: sweet-social-space → Create (leave empty, no README)
2. On the empty repo page, click "uploading an existing file"
3. Drag ALL files from this folder in, Commit
OR via git:
```
git init
git add .
git commit -m "Sweet Social Space v1"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/sweet-social-space.git
git push -u origin main
```

## 5. Deploy to Vercel
1. vercel.com → Add New → Project → Import your sweet-social-space GitHub repo
2. Add Environment Variables:
   NEXT_PUBLIC_SUPABASE_URL = your url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your anon key
3. Deploy
4. Once live: Vercel → Settings → Domains → Add sweetsocialspace.com
   Copy the DNS records Vercel gives you into your domain registrar

## Local Alerts automation
See `app/api/alerts/ingest/route.ts`
This is a real cron endpoint. In Vercel → Settings → Cron Jobs, enable:
`/api/alerts/ingest` → Every 15 minutes
Right now it seeds a sample San Jose alert so you can see it work. Wire in real feeds (Caltrans, PulsePoint, Nixle) in that one file.

You own everything. No platform lock-in.
