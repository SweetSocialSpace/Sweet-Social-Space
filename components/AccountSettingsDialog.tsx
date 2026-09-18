'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from '@/lib/translations'

export function AccountSettingsDialog({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState('')
  const t = useTranslations() as any
  const supabase = createClient() as any

  const exportData = async () => {
    setBusy(true); setMsg('')
    try {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return
      const [ { data: profile }, { data: privateProfile }, { data: posts }, { data: likes }, { data: reports }, { data: subs }, { data: boosts } ] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', u.user.id).maybeSingle(),
        (supabase as any).rpc('get_my_private_profile'),
        supabase.from('posts').select('*').eq('user_id', u.user.id),
        supabase.from('post_likes').select('*').eq('user_id', u.user.id),
        supabase.from('post_reports').select('*').eq('reporter_id', u.user.id),
        supabase.from('subscriptions').select('*').eq('user_id', u.user.id),
        supabase.from('post_boosts').select('*').eq('user_id', u.user.id),
      ])
      const privateRow = Array.isArray(privateProfile)? privateProfile[0] : privateProfile
      const fullProfile = {...(profile?? {}),...(privateRow?? {}) }
      const payload = { exported_at: new Date().toISOString(), account: { id: u.user.id, email: u.user.email, created_at: u.user.created_at }, profile: fullProfile, posts, likes, reports, subscriptions: subs, post_boosts: boosts }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `sweet-social-data-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url)
      setMsg(t?.account?.exported)
    } catch (e: any) { setMsg(e.message || t?.account?.exportFailed) } finally { setBusy(false) }
  }

  const requestDeletion = async () => {
    if (confirmDelete!== 'DELETE') return
    setBusy(true); setMsg('')
    try {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return
      const { error } = await supabase.from('account_deletion_requests').insert({ user_id: u.user.id, reason: 'user requested via settings' })
      if (error && (error as any).code!== '23505') { setMsg(error.message); return }
      setMsg(t?.account?.deletionReceived)
    } catch (e: any) { setMsg(e.message || t?.account?.requestFailed) } finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-lg font-semibold">{t?.account?.privacyTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t?.account?.privacyDesc}</p>
        <div className="mt-4 space-y-2"><button onClick={()=>{ try { exportData() } catch {} }} disabled={busy} className="w-full rounded-xl border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50">{t?.account?.exportBtn}</button></div>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/30"><p className="text-sm font-medium text-red-900 dark:text-red-200">{t?.account?.deleteTitle}</p><p className="mt-1 text-xs text-red-800/80 dark:text-red-200/80">{t?.account?.deleteDesc}</p><input value={confirmDelete} onChange={(e) => { try { setConfirmDelete(e.target.value) } catch {} }} placeholder={t?.account?.deletePlaceholder} className="mt-2 w-full rounded-lg border border-red-300 bg-background px-3 py-2 text-sm" /><button onClick={()=>{ try { requestDeletion() } catch {} }} disabled={busy || confirmDelete!== 'DELETE'} className="mt-2 w-full rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{t?.account?.requestDeletion}</button></div>
        {msg && <p className="mt-3 text-sm text-foreground">{msg}</p>}
        <div className="mt-5 flex items-center justify-between"><button onClick={() => { try { window.dispatchEvent(new Event('open-cookie-settings')) } catch {} }} className="text-xs text-muted-foreground underline">{t?.account?.cookieSettings}</button><button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">{t?.common?.close}</button></div>
      </div>
    </div>
  )
}
