'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AccountSettingsDialog({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState('')

  const exportData = async () => {
    setBusy(true)
    setMsg('')
    try {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return

      const [
        { data: profile },
        { data: privateProfile },
        { data: posts },
        { data: likes },
        { data: reports },
        { data: subs },
        { data: boosts }
      ] = await Promise.all([
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

      const payload = {
        exported_at: new Date().toISOString(),
        account: { id: u.user.id, email: u.user.email, created_at: u.user.created_at },
        profile: fullProfile,
        posts,
        likes,
        reports,
        subscriptions: subs,
        post_boosts: boosts,
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sweet-social-data-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMsg('Your data has been downloaded as JSON.')
    } catch (e: any) {
      setMsg(e.message || 'Export failed')
    } finally {
      setBusy(false)
    }
  }

  const requestDeletion = async () => {
    if (confirmDelete!== 'DELETE') return
    setBusy(true)
    setMsg('')
    try {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return

      const { error } = await supabase.from('account_deletion_requests').insert({
        user_id: u.user.id,
        reason: 'user requested via settings',
      })

      if (error && error.code!== '23505') {
        setMsg(error.message)
        return
      }
      setMsg('Deletion request received. Your account and data will be erased within 30 days. You can keep using the app until then or sign out now.')
    } catch (e: any) {
      setMsg(e.message || 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-lg font-semibold">Privacy & data</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Under GDPR and CCPA you can export your data or delete your account at any time.
        </p>

        <div className="mt-4 space-y-2">
          <button onClick={exportData} disabled={busy} className="w-full rounded-xl border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50">
            Export all my data (JSON)
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-900 dark:text-red-200">Delete my account</p>
          <p className="mt-1 text-xs text-red-800/80 dark:text-red-200/80">
            We’ll erase your account, posts, likes, and profile within 30 days. Some records (billing, abuse reports) may
            be kept longer if required by law. Type <strong>DELETE</strong> to confirm.
          </p>
          <input
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            placeholder="Type DELETE"
            className="mt-2 w-full rounded-lg border border-red-300 bg-background px-3 py-2 text-sm"
          />
          <button onClick={requestDeletion} disabled={busy || confirmDelete!== 'DELETE'} className="mt-2 w-full rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            Request deletion
          </button>
        </div>

        {msg && <p className="mt-3 text-sm text-foreground">{msg}</p>}

        <div className="mt-5 flex items-center justify-between">
          <button onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))} className="text-xs text-muted-foreground underline">
            Cookie settings
          </button>
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">Close</button>
        </div>
      </div>
    </div>
  )
}
