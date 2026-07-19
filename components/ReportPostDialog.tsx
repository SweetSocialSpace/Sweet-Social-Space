'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MicRecorder from '@/components/mic/MicRecorder'

const REASONS = [
  'Spam or scam',
  'Harassment or hate speech',
  'Violence or threats',
  'Sexual content involving minors',
  'Non-consensual intimate content',
  'Copyright / DMCA',
  'Self-harm or dangerous content',
  'Impersonation',
  'Other',
]

export function ReportPostDialog({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [reason, setReason] = useState(REASONS[0])
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) { setError('Please sign in to report.'); return }
      const { error: err } = await supabase.from('post_reports').insert({
        post_id: postId,
        reporter_id: u.user.id,
        reason,
        details: details.trim() || null,
      })
      if (err) {
        if (err.code === '23505') setDone(true)
        else setError(err.message)
        return
      }
      setDone(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {done? (
          <>
            <h2 className="font-display text-lg font-semibold">Thanks for reporting</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our team will review this post. Repeat-reported posts are automatically hidden pending review.
            </p>
            <div className="mt-4 flex justify-end">
              <button onClick={onClose} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Close</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-lg font-semibold">Report post</h2>
            <p className="mt-1 text-xs text-muted-foreground">Reports are confidential.</p>
            <label className="mt-4 block text-sm font-medium">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            <label className="mt-3 block text-sm font-medium">Details (optional)</label>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={500} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Add any context that will help us review." />
            <div className="mt-1 flex justify-end">
             <MicRecorder onTranscript={setDetails} />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
              <button onClick={submit} disabled={busy} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                {busy? 'Sending…' : 'Submit report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
