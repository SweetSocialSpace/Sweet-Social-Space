import Link from 'next/link'
import { EmergencyAlerts } from '@/components/EmergencyAlerts'
import { LatestAlerts } from '@/components/LatestAlerts'
import { WhatsHappeningNearYou } from '@/components/WhatsHappeningNearYou'
import { UpcomingEvents } from '@/components/UpcomingEvents'
import { BusinessDirectory } from '@/components/BusinessDirectory'
import { MarketplacePreview } from '@/components/MarketplacePreview'
import { VerifiedSources } from '@/components/VerifiedSources'
import { RecommendationCategories } from '@/components/RecommendationCategories'
import { LocationScopeBar } from '@/components/LocationScopeBar'
import { LoginPromptDialog } from '@/components/LoginPromptDialog'
import { FeedPage } from './feed/FeedPage'

// TODO: Replace with real Supabase auth check
async function getUser() {
  return null // We'll wire this up next
}

export default async function Home() {
  const user = await getUser()

  if (user) return <FeedPage />
  return <Landing />
}

function Landing() {
  const authed = false // TODO: wire to real auth

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <LoginPromptDialog />

      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24 md:pt-20">
        <EmergencyAlerts />
        <LocationScopeBar />
        <LatestAlerts />
        <UpcomingEvents />
        <WhatsHappeningNearYou />
        <BusinessDirectory />

        <section className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Your neighborhood, in one place
            </span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] md:text-7xl">
              Everything happening
              <br />
              <span style={{ backgroundImage: "var(--gradient-warm)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                near you.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              News, events, alerts, businesses, recommendations, and real conversations from your block — all in one place. Stay connected to your neighborhood.
            </p>
            <p className="mt-3 max-w-xl text-sm font-medium italic text-primary/80">
              "Love thy neighbor as you love thyself." — Speak your mind, be respectful, no threats.
            </p>

            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {authed? (
                <Link
                  href="/feed"
                  className="group relative inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-100"
                  style={{ background: "var(--gradient-warm)", boxShadow: "var(--shadow-sweet)" }}
                >
                  Go to your feed
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="group relative inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-100"
                  style={{ background: "var(--gradient-warm)", boxShadow: "var(--shadow-sweet)" }}
                >
                  Join your block
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              )}
              <span className="text-sm text-muted-foreground">Email + name. We never sell your data.</span>
            </div>
            {!authed && (
              <p className="mt-4 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth" className="font-semibold text-primary underline hover:text-primary/80">
                  Sign in
                </Link>
              </p>
            )}
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl opacity-60 blur-2xl" style={{ background: "var(--gradient-warm)" }} />
            <div className="relative space-y-3 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
              <PreviewPost name="Marcy on Elm St." time="2m" body="Coyote spotted near the playground at 6am. Keep small dogs on leash this week 🐾" tag="Alert" />
              <PreviewPost name="Dan @ Hardware" time="1h" body="Free leftover mulch on my driveway 'til Sunday. Bring a bucket, take what you need." tag="Free stuff" />
              <PreviewPost name="Ana R." time="3h" body="Hot take: the new bike lane on 4th is actually fantastic, fight me in the comments." tag="Hot take" />
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-border p-6 md:p-10 shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-warm)" }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-primary-foreground">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-80">The heartbeat</div>
              <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">Your community feed</h2>
              <p className="mt-2 max-w-xl text-sm opacity-90 md:text-base">
                Neighbor posts, events, alerts, verified announcements, and business updates — mixed together, ranked by distance, freshness, and relevance. Open it in the morning. See your block.
              </p>
            </div>
            <Link
              href={authed? "/feed" : "/auth"}
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground shadow hover:opacity-90"
            >
              Open your feed <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <PillarHeader number="1" emoji="📰" title="Stay informed" subtitle="News, alerts, and updates you can trust — from your block." />
        <VerifiedSources />

        <PillarHeader number="2" emoji="💬" title="Connect locally" subtitle="Posts, discussions, and events with the people on your block." />

        <section className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold md:text-3xl">Your community</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pick how wide to listen. We'll remember it.</p>
            </div>
            <Link href={authed? "/feed" : "/auth"} className="text-sm font-medium text-primary hover:underline">
              Open your feed →
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { l: "5 miles", e: "🏠" },
              { l: "20 miles", e: "🏘" },
              { l: "50 miles", e: "🌆" },
              { l: "Statewide", e: "🗺" },
              { l: "Nationwide", e: "🇺🇸" },
            ].map((r) => (
              <Link
                key={r.l}
                href={authed? "/feed" : "/auth"}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-medium transition hover:bg-secondary"
              >
                <span aria-hidden>{r.e}</span>
                {r.l}
              </Link>
            ))}
          </div>
        </section>

        <PillarHeader number="3" emoji="🤝" title="Support your community" subtitle="Shop the businesses and pros your neighbors actually trust." />
        <RecommendationCategories />

        <PillarHeader number="4" emoji="🛒" title="Buy & sell" subtitle="A local marketplace — furniture, tools, cars, electronics, kid stuff." />
        <MarketplacePreview />

        <section id="rules" className="mt-16 rounded-3xl border border-border bg-card p-8 md:p-12 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-3xl font-bold md:text-4xl">House rules (all of them)</h2>
          <ol className="mt-6 space-y-3 text-base text-muted-foreground">
            <li><span className="font-semibold text-foreground">1.</span> Do not threaten to kill someone or their family member.</li>
            <li><span className="font-semibold text-foreground">2.</span> Do not threaten to blow up someone's house or cause property damage.</li>
            <li><span className="font-semibold text-foreground">3.</span> No fraud, scams, impersonation, or illegal activity.</li>
            <li><span className="font-semibold text-foreground">4.</span> Treat your neighbors with respect — love thy neighbor as you love thyself. Disagreement is welcome; cruelty is not.</li>
            <li><span className="font-semibold text-foreground">5.</span> That's it. Talk like adults. First Amendment lives here.</li>
          </ol>
          {authed? (
            <Link href="/feed" className="mt-8 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90">
              Go to your feed
            </Link>
          ) : (
            <Link href="/auth" className="mt-8 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90">
              Create your account
            </Link>
          )}
        </section>
      </main>
    </div>
  )
}

function PillarHeader({ number, emoji, title, subtitle }: { number: string; emoji: string; title: string; subtitle: string }) {
  return (
    <div className="mt-20 flex items-center gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-2xl shadow-[var(--shadow-soft)]">{emoji}</div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">Pillar {number}</div>
        <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function PreviewPost({ name, time, body, tag }: { name: string; time: string; body: string; tag: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full" style={{ background: "var(--gradient-warm)" }} />
          <span className="font-semibold text-foreground">{name}</span>
          <span className="text-muted-foreground">· {time}</span>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text- font-medium text-secondary-foreground">{tag}</span>
      </div>
      <p className="mt-2 text-sm text-foreground">{body}</p>
    </div>
  )
}
