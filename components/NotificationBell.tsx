'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

async function countMyUnreadNotifications(): Promise<{ count: number }> {
  try {
    const supabase = createClient() as any
    let user: any = null; try { const { data } = await supabase.auth.getUser(); user = data.user } catch {}
    if (!user) return { count: 0 }
    const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false)
    if (error) throw error
    return { count: count || 0 }
  } catch { return { count: 0 } }
}

export function NotificationBell({ className = '' }: { className?: string }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    try {
      const supabase = createClient() as any
      supabase.auth.getUser().then(({ data }: any) => { try { setUserId(data.user?.id?? null) } catch {} }).catch(()=>{})
      const { data: sub } = supabase.auth.onAuthStateChange((_e: any, s: any) => { try { setUserId(s?.user?.id?? null) } catch {} })
      return () => { try { sub.subscription.unsubscribe() } catch {} }
    } catch {}
  }, [])

  useEffect(() => {
    if (!userId) { setCount(0); return }
    let cancelled = false
    const refresh = () => { try { countMyUnreadNotifications().then((r) => { if (!cancelled) try { setCount(r.count) } catch {} }).catch(() => {}) } catch {} }
    refresh()
    let channel: any = null
    try {
      const supabase = createClient() as any
      const safeId = String(userId).slice(0,36)
      channel = supabase.channel(`notif-bell-${safeId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${safeId}` }, () => refresh()).subscribe()
    } catch {}
    return () => { cancelled = true; try { if (channel) { const supabase = createClient() as any; supabase.removeChannel(channel) } } catch {} }
  }, [userId])

  if (!userId) return null

  return (
    <Link href="/notifications" aria-label={count? `${count} unread notifications` : 'Notifications'} className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-secondary ${className}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
      {count > 0 && (<span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text- font-bold leading-4 text-primary-foreground">{count > 99? '99+' : count}</span>)}
    </Link>
  )
}
