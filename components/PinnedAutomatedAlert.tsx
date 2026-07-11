'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// TODO: We'll port these files later from Lovable
// import { useAuth } from '@/hooks/useAuth'
// import { AutomatedBadge } from '@/components/AutomatedBadge'

const HUMAN_THRESHOLD = 3

type AlertPost = {
  id: string
  body: string
  tag: string | null
  created_at: string
}

// Stub hook - replace with real one when we port hooks/useAuth.ts
function useAuth() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  return { user }
}

// Stub badge component
function AutomatedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text- font-semibold text-muted-foreground">
      🤖 AUTO
    </span>
  )
}

/**
 * Pins the most recent AUTOMATED post for the signed-in user's ZIP to the top
 * of the feed for 24h, but only while the area is quiet (<3 human posts in the
 * same 24h window in that ZIP). Ensures the feed is never empty for any ZIP.
 */
export function PinnedAutomatedAlert() {
  const { user } = useAuth()
  const [alert, setAlert] = useState<AlertPost | null>(null)
  const [zip, setZip] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!user) {
        setAlert(null)
        return
      }

      const { data: prof } = await supabase
       .from('profiles')
       .select('zip_code')
       .eq('user_id', user.id)
       .maybeSingle()

      const userZip = (prof as any)?.zip_code?? null
      if (!userZip || cancelled) {
        setZip(userZip)
        return
      }
      setZip(userZip)

      try {
        const since24 = new Date(Date.now() - 24 * 3600_000).toISOString()

        // Count recent posts (any author) in this ZIP. We use the bot-post
        // detection by tag "Alert"/"General" filtering further below.
        const { data: recent } = await supabase
         .from('posts')
         .select('id, user_id, body, tag, created_at, hidden')
         .eq('zip_code', userZip)
         .gte('created_at', since24)
         .order('created_at', { ascending: false })
         .limit(50)

        const rows = (recent?? []).filter((r: any) =>!r.hidden)
        const { data: bots } = await supabase
         .from('profiles')
         .select('user_id')
         .ilike('display_name', '%bot%')
        const botIds = new Set((bots?? []).map((b: any) => b.user_id))

        const humans = rows.filter((r: any) =>!botIds.has(r.user_id))
        if (humans.length >= HUMAN_THRESHOLD) {
          if (!cancelled) setAlert(null)
          return
        }

        const automated = rows.find((r: any) => botIds.has(r.user_id))
        if (!cancelled) setAlert((automated as AlertPost | null)?? null)
      } catch {
        if (!cancelled) setAlert(null)
      }
    })()
    return () => { cancelled = true }
  }, [user])

  if (!alert) return null

  return (
    <section
      aria-label={`Latest verified alert for ${zip?? 'your area'}`}
      className="mt-4 rounded-3xl border-2 border-primary bg-card p-5 shadow-[var(--shadow-soft)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text- font-semibold uppercase tracking-wide text-primary">
          <span aria-hidden>📌</span>
          Latest verified alert for {zip}
        </span>
        <AutomatedBadge />
        <span className="ml-auto text-xs text-muted-foreground">
          {new Date(alert.created_at).toLocaleString()}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{alert.body}</p>
      <div className="mt-3 text-xs">
        <Link href={`/#post-${alert.id}`} className="font-semibold text-primary hover:underline">
          Open this post →
        </Link>
      </div>
    </section>
  )
}
