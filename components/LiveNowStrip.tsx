'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// TODO: We'll port these files later from Lovable
// import { listLiveStreams, type LiveStreamCard } from '@/lib/livestream.functions'

// Stub types until we port the real files
type LiveStreamCard = {
  id: string
  title: string
  display_name: string
  avatar_url: string | null
}

export function LiveNowStrip() {
  const [streams, setStreams] = useState<LiveStreamCard[]>([])
  const [authed, setAuthed] = useState(false)

  const load = useCallback(async () => {
    try {
      const supabase = createClient()
      // TODO: Replace with listLiveStreams server action when we port it
      const { data, error } = await supabase
   .from('live_streams')
   .select('id, title, user:users(display_name, avatar_url)')
   .eq('status', 'live')
   .limit(12)

      if (error) throw error

      const mapped = data?.map((s: any) => ({
        id: s.id,
        title: s.title,
        display_name: s.user?.display_name?? 'Unknown',
        avatar_url: s.user?.avatar_url?? null,
      }))?? []

      setStreams(mapped)
    } catch {
      setStreams([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      const signedIn =!!data.session
      setAuthed(signedIn)
      if (signedIn) load()
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const signedIn =!!session
      setAuthed(signedIn)
      if (signedIn) load()
      else setStreams([])
    })
    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [load])

  useEffect(() => {
    if (!authed) return
    const supabase = createClient()
    const channel = supabase
  .channel('live-now-strip')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, () => load())
  .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [authed, load])

  if (!streams.length) return null

  return (
    <div className="mb-4 rounded-2xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Live now
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {streams.map((s) => (
          <Link
            key={s.id}
            href={`/live/${s.id}`}
            className="group flex min-w-0 flex-col rounded-xl border border-border bg-background p-2 transition hover:bg-secondary"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-red-500/20 via-secondary to-secondary">
              <div className="absolute inset-0 flex items-center justify-center">
                {s.avatar_url
             ? <img src={s.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-background" />
                  : <div className="h-12 w-12 rounded-full bg-secondary ring-2 ring-background" />}
              </div>
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text- font-bold text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
              </span>
            </div>
            <p className="mt-2 truncate text-xs font-semibold">{s.display_name}</p>
            <p className="truncate text- text-muted-foreground">{s.title}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
